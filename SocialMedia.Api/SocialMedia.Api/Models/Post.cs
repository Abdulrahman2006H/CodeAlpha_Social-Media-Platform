using System.Xml.Linq;

namespace SocialMedia.Api.Models
{
    public class Post
    {
        public int Id { get; set; }

        public string Content { get; set; } = "";
        public string? ImageUrl { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.Now;

        public int UserId { get; set; }
        public User? User { get; set; }

        public ICollection<Comment>? Comments { get; set; }
        public ICollection<Like>? Likes { get; set; }
    }
}