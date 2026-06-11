using Microsoft.Extensions.Hosting;
using System.Xml.Linq;

namespace SocialMedia.Api.Models
{
    public class User
    {
        public int Id { get; set; }

        public string FullName { get; set; } = "";
        public string UserName { get; set; } = "";
        public string Email { get; set; } = "";
        public string Password { get; set; } = "";

        public string? Bio { get; set; }
        public string? ProfileImage { get; set; }
        public string? CoverImage { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.Now;

        public ICollection<Post>? Posts { get; set; }
        public ICollection<Comment>? Comments { get; set; }
        public ICollection<Like>? Likes { get; set; }
    }
}