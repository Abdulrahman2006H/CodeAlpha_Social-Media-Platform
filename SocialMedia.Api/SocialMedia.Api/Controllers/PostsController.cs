using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SocialMedia.Api.Data;
using SocialMedia.Api.Models;

namespace SocialMedia.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PostsController : ControllerBase
    {
        private readonly SocialMediaDbContext _context;

        public PostsController(SocialMediaDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetPosts([FromQuery] int? currentUserId)
        {
            var posts = await _context.Posts
                .Include(p => p.User)
                .Include(p => p.Likes)
                .Include(p => p.Comments)!
                    .ThenInclude(c => c.User)
                .OrderByDescending(p => p.CreatedAt)
                .Select(p => new
                {
                    p.Id,
                    p.Content,
                    p.ImageUrl,
                    p.CreatedAt,
                    User = new
                    {
                        p.User!.Id,
                        p.User.FullName,
                        p.User.UserName,
                        p.User.ProfileImage,
                        IsFollowing = currentUserId.HasValue &&
                            _context.Follows.Any(f =>
                                f.FollowerId == currentUserId.Value &&
                                f.FollowingId == p.UserId)
                    },
                    LikesCount = p.Likes!.Count,
                    CommentsCount = p.Comments!.Count,
                    Comments = p.Comments.Select(c => new
                    {
                        c.Id,
                        c.Text,
                        c.CreatedAt,
                        User = new
                        {
                            c.User!.Id,
                            c.User.FullName,
                            c.User.UserName,
                            c.User.ProfileImage
                        }
                    }),
                    IsLikedByCurrentUser = currentUserId.HasValue &&
                    p.Likes!.Any(l => l.UserId == currentUserId.Value)
                })
                .ToListAsync();

            return Ok(posts);
        }

        [HttpPost]
        public async Task<IActionResult> CreatePost([FromForm] CreatePostRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Content))
                return BadRequest("Post content is required");

            var user = await _context.Users.FindAsync(request.UserId);

            if (user == null)
                return BadRequest("User not found");

            string? imageUrl = null;

            if (request.Image != null && request.Image.Length > 0)
            {
                var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads");

                if (!Directory.Exists(uploadsFolder))
                    Directory.CreateDirectory(uploadsFolder);

                var fileName = Guid.NewGuid().ToString() + Path.GetExtension(request.Image.FileName);
                var filePath = Path.Combine(uploadsFolder, fileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await request.Image.CopyToAsync(stream);
                }

                var baseUrl = $"{Request.Scheme}://{Request.Host}";
                imageUrl = $"{baseUrl}/uploads/{fileName}";
            }

            var post = new Post
            {
                Content = request.Content,
                ImageUrl = imageUrl,
                UserId = request.UserId,
                CreatedAt = DateTime.Now
            };

            _context.Posts.Add(post);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                post.Id,
                post.Content,
                post.ImageUrl,
                post.CreatedAt,
                User = new
                {
                    user.Id,
                    user.FullName,
                    user.UserName,
                    user.ProfileImage
                },
                LikesCount = 0,
                CommentsCount = 0,
                Comments = new List<object>(),
                IsLikedByCurrentUser = false
            });
        }

        [HttpPost("{postId}/like")]
        public async Task<IActionResult> ToggleLike(int postId, [FromBody] LikeRequestDto dto)
        {
            var post = await _context.Posts.FindAsync(postId);

            if (post == null)
                return NotFound();

            var existingLike = await _context.Likes
                .FirstOrDefaultAsync(l => l.PostId == postId && l.UserId == dto.UserId);

            if (existingLike != null)
            {
                _context.Likes.Remove(existingLike);
                await _context.SaveChangesAsync();

                var likesCountAfterRemove = await _context.Likes
                    .CountAsync(l => l.PostId == postId);

                return Ok(new
                {
                    isLikedByCurrentUser = false,
                    likesCount = likesCountAfterRemove
                });
            }

            var like = new Like
            {
                PostId = postId,
                UserId = dto.UserId
            };

            _context.Likes.Add(like);
            await _context.SaveChangesAsync();

            var likesCount = await _context.Likes
                .CountAsync(l => l.PostId == postId);

            return Ok(new
            {
                isLikedByCurrentUser = true,
                likesCount
            });
        }
        [HttpPost("{postId}/comments")]
        public async Task<IActionResult> AddComment(int postId, CreateCommentRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Text))
                return BadRequest("Comment text is required");

            var post = await _context.Posts.FindAsync(postId);

            if (post == null)
                return NotFound("Post not found");

            var user = await _context.Users.FindAsync(request.UserId);

            if (user == null)
                return BadRequest("User not found");

            var comment = new Comment
            {
                Text = request.Text,
                UserId = request.UserId,
                PostId = postId,
                CreatedAt = DateTime.Now
            };

            _context.Comments.Add(comment);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                comment.Id,
                comment.Text,
                comment.CreatedAt,
                User = new
                {
                    user.Id,
                    user.FullName,
                    user.UserName,
                    user.ProfileImage
                }
            });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePost(int id)
        {
            var post = await _context.Posts.FindAsync(id);

            if (post == null)
                return NotFound();

            _context.Posts.Remove(post);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Post deleted" });
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdatePost(int id, UpdatePostRequest request)
        {
            var post = await _context.Posts.FindAsync(id);

            if (post == null)
                return NotFound("Post not found");

            if (string.IsNullOrWhiteSpace(request.Content))
                return BadRequest("Post content is required");

            post.Content = request.Content;
            post.ImageUrl = request.ImageUrl;

            await _context.SaveChangesAsync();

            return Ok(post);
        }

        public class UpdatePostRequest
        {
            public string Content { get; set; } = "";
            public string? ImageUrl { get; set; }
        }
    }

    public class CreatePostRequest
    {
        public int UserId { get; set; }
        public string Content { get; set; } = "";
        public IFormFile? Image { get; set; }
    }

    public class LikeRequestDto
    {
        public int UserId { get; set; }
    }

    public class CreateCommentRequest
    {
        public int UserId { get; set; }
        public string Text { get; set; } = "";
    }
}