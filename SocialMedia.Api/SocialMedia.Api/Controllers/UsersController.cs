using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SocialMedia.Api.Data;
using SocialMedia.Api.Models;

namespace SocialMedia.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        private readonly SocialMediaDbContext _context;

        public UsersController(SocialMediaDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetUsers([FromQuery] int? currentUserId)
        {
            var users = await _context.Users
                .Select(u => new
                {
                    u.Id,
                    u.FullName,
                    u.UserName,
                    u.Email,
                    u.Bio,
                    u.ProfileImage,
                    FollowersCount = _context.Follows.Count(f => f.FollowingId == u.Id),
                    FollowingCount = _context.Follows.Count(f => f.FollowerId == u.Id),
                    PostsCount = _context.Posts.Count(p => p.UserId == u.Id),

                    IsFollowing = currentUserId.HasValue &&
                        _context.Follows.Any(f =>
                            f.FollowerId == currentUserId.Value &&
                            f.FollowingId == u.Id)
                })
                .ToListAsync();

            return Ok(users);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetUser(int id)
        {
            var user = await _context.Users
                .Where(u => u.Id == id)
                .Select(u => new
                {
                    u.Id,
                    u.FullName,
                    u.UserName,
                    u.Email,
                    u.Bio,
                    u.ProfileImage,
                    FollowersCount = _context.Follows.Count(f => f.FollowingId == u.Id),
                    FollowingCount = _context.Follows.Count(f => f.FollowerId == u.Id),
                    Posts = _context.Posts
                        .Where(p => p.UserId == u.Id)
                        .OrderByDescending(p => p.CreatedAt)
                        .Select(p => new
                        {
                            p.Id,
                            p.Content,
                            p.ImageUrl,
                            p.CreatedAt,
                            LikesCount = _context.Likes.Count(l => l.PostId == p.Id),
                            CommentsCount = _context.Comments.Count(c => c.PostId == p.Id)
                        })
                        .ToList()
                })
                .FirstOrDefaultAsync();

            if (user == null)
                return NotFound();

            return Ok(user);
        }

        [HttpPost("{followingId}/follow")]
        public async Task<IActionResult> FollowUser(int followingId, FollowRequest request)
        {
            if (followingId == request.FollowerId)
                return BadRequest("You cannot follow yourself");

            var userExists = await _context.Users.AnyAsync(u => u.Id == followingId);
            var followerExists = await _context.Users.AnyAsync(u => u.Id == request.FollowerId);

            if (!userExists || !followerExists)
                return NotFound("User not found");

            var existingFollow = await _context.Follows
                .FirstOrDefaultAsync(f =>
                    f.FollowerId == request.FollowerId &&
                    f.FollowingId == followingId);

            if (existingFollow != null)
            {
                _context.Follows.Remove(existingFollow);
                await _context.SaveChangesAsync();

                return Ok(new
                {
                    message = "Unfollowed",
                    isFollowing = false,
                    followersCount = _context.Follows.Count(f => f.FollowingId == followingId)
                });
            }

            var follow = new Follow
            {
                FollowerId = request.FollowerId,
                FollowingId = followingId
            };

            _context.Follows.Add(follow);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Followed",
                isFollowing = true,
                followersCount = _context.Follows.Count(f => f.FollowingId == followingId)
            });
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateUser(int id, UpdateUserDto dto)
        {
            var user = await _context.Users.FindAsync(id);

            if (user == null)
                return NotFound();

            user.FullName = dto.FullName;
            user.Bio = dto.Bio;

            await _context.SaveChangesAsync();

            return Ok(user);
        }
    }

    public class FollowRequest
    {
        public int FollowerId { get; set; }
    }

    public class UpdateUserDto
    {
        public string FullName { get; set; }
        public string? Bio { get; set; }
    }
}