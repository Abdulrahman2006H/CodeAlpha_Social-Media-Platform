import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PostService } from '../../services/post.service';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

type CommentDto = {
  id: number;
  text: string;
  createdAt: string;
  user: {
    id: number;
    fullName: string;
    userName: string;
    profileImage?: string | null;
  };
};

type PostDto = {
  id: number;
  content: string;
  imageUrl?: string | null;
  createdAt: string;
  user: {
    id: number;
    fullName: string;
    userName: string;
    profileImage?: string | null;
    isFollowing?: boolean;
  };
  likesCount: number;
  commentsCount: number;
  comments: CommentDto[];

showMenu?: boolean;
newComment?: string;
showComments?: boolean;
isLikedByCurrentUser?: boolean;
likeLoading?: boolean;
};

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  postText = '';
  sortBy = 'Recent';


suggestions: any[] = [];
activities: any[] = [];
trendingTopics = [
  { name: 'design', posts: '12.5K' },
  { name: 'frontend', posts: '8.2K' },
  { name: 'photography', posts: '5.7K' },
  { name: 'uiux', posts: '4.1K' }
];

selectedImage: File | null = null;
imagePreview: string | null = null;

showProfileMenu = false;

currentUserId = 0;
currentUser: any = null;

  posts: PostDto[] = [];
  loadingPosts = false;

constructor(
  private postService: PostService,
  private authService: AuthService,
  private userService: UserService,
  private router: Router
) {}

ngOnInit(): void {
  const user = this.authService.getCurrentUser();

  if (user) {
    this.currentUserId = user.id;
    this.currentUser = user;
  }

  this.loadCurrentUserProfile();
  this.loadPosts();
  this.loadSuggestedUsers();
  this.loadActivities();
}

loadCurrentUserProfile(): void {
  if (!this.currentUserId) return;

  this.userService.getUserById(this.currentUserId).subscribe({
    next: (res) => {
      this.currentUser = res;
      console.log('Current user profile:', res);
    },
    error: (err) => {
      console.log('Error loading current user:', err);
    }
  });
}


loadSuggestedUsers(): void {
  if (!this.currentUserId) return;

  this.userService.getUsers(this.currentUserId).subscribe({
    next: (res) => {
      this.suggestions = res
        .filter(user => user.id !== this.currentUserId)
        .slice(0, 4)
        .map(user => ({
          id: user.id,
          name: user.fullName,
          subtitle: user.bio || `@${user.userName}`,
          avatar: user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U',
          following: user.isFollowing,
          action: user.isFollowing ? 'Following' : 'Follow',
          followersCount: user.followersCount
        }));
    },
    error: (err) => {
      console.log('Error loading suggested users:', err);
    }
  });
}

loadActivities(): void {
  this.activities = [
    { image: '❤️', name: 'Reinhard Von Zry', text: 'liked your post', time: '2m ago' },
    { image: '💬', name: 'Briansky', text: 'commented on your post', time: '10m ago' },
    { image: '👥', name: 'Shivadjps', text: 'started following you', time: '1h ago' },
    { image: '🔖', name: 'Deresa Heren', text: 'saved your post', time: '2h ago' }
  ];
}

loadPosts(): void {
  this.postService.getPosts(this.currentUserId).subscribe({
    next: (res) => {
      this.posts = res;
    },
    error: (err) => {
      console.log('Error loading posts:', err);
    }
  });
}

createPost(): void {
  if (!this.postText.trim() && !this.selectedImage) {
    return;
  }

  const user = this.authService.getCurrentUser();

  if (!user || !user.id) {
    console.log('No logged in user found');
    return;
  }

  const formData = new FormData();
  formData.append('userId', user.id.toString());
  formData.append('content', this.postText);

  if (this.selectedImage) {
    formData.append('image', this.selectedImage);
  }

  this.postService.createPost(formData).subscribe({
    next: () => {
      this.postText = '';
      this.selectedImage = null;
      this.imagePreview = null;

      this.loadPosts();
      this.loadCurrentUserProfile();
    },
    error: (err) => {
      console.log('Error creating post:', err);
    }
  });
}
toggleLike(post: any) {
  if (post.likeLoading) return;

  post.likeLoading = true;

  this.postService.toggleLike(post.id).subscribe({
    next: (res: any) => {
      post.isLikedByCurrentUser = res.isLikedByCurrentUser;
      post.likesCount = res.likesCount;
      post.likeLoading = false;
    },
    error: () => {
      post.likeLoading = false;
      alert('Something went wrong while liking the post');
    }
  });
}


  toggleComments(post: PostDto): void {
    post.showComments = !post.showComments;
  }

addComment(post: any): void {
  if (!post.newComment || !post.newComment.trim()) {
    return;
  }

  if (!this.currentUserId) {
    console.log('User not logged in');
    return;
  }

  const data = {
    userId: this.currentUserId,
    text: post.newComment
  };

  console.log('Comment data sent:', data);

  this.postService.addComment(post.id, data).subscribe({
    next: () => {
      post.newComment = '';
      this.loadPosts();
    },
    error: (err) => {
      console.log('Error adding comment:', err);
    }
  });
}
followPostAuthor(post: any): void {
  if (!this.currentUserId) {
    console.log('No logged in user');
    return;
  }

  if (post.user.id === this.currentUserId) {
    alert('You cannot follow yourself');
    return;
  }

  this.userService.followUser(post.user.id, this.currentUserId).subscribe({
    next: (res) => {
      post.user.isFollowing = res.isFollowing;
      post.user.followersCount = res.followersCount;

      this.loadSuggestedUsers();
      this.loadCurrentUserProfile();
    },
    error: (err) => {
      console.log('Error following post author:', err);
    }
  });
}

toggleSuggestion(user: any): void {
  if (!this.currentUserId) {
    console.log('No logged in user');
    return;
  }

  this.userService.followUser(user.id, this.currentUserId).subscribe({
    next: (res) => {
      user.following = res.isFollowing;
      user.action = res.isFollowing ? 'Following' : 'Follow';
      user.followersCount = res.followersCount;

      this.loadPosts();
      this.loadCurrentUserProfile();
    },
    error: (err) => {
      console.log('Error following user:', err);
    }
  });
}


  openProfile(): void {
    console.log('Open profile');
  }

  getUserInitial(name?: string): string {
    return name ? name.charAt(0).toUpperCase() : '?';
  }

  onImageSelected(event: Event): void {
  const input = event.target as HTMLInputElement;

  if (!input.files || input.files.length === 0) {
    return;
  }

  this.selectedImage = input.files[0];

  const reader = new FileReader();
  reader.onload = () => {
    this.imagePreview = reader.result as string;
  };

  reader.readAsDataURL(this.selectedImage);
}
toggleProfileMenu(): void {
  this.showProfileMenu = !this.showProfileMenu;
}

openMyProfile(): void {
  this.showProfileMenu = false;
  this.router.navigate(['/profile']);
}

logout(): void {
  localStorage.removeItem('currentUser');
  this.router.navigate(['/login']);
}

  togglePostMenu(post: any): void {
  this.posts.forEach(p => {
    if (p.id !== post.id) {
      p.showMenu = false;
    }
  });

  post.showMenu = !post.showMenu;
}

editPost(post: any): void {
  post.showMenu = false;

  const newContent = prompt('Edit your post:', post.content);

  if (newContent === null) {
    return;
  }

  if (!newContent.trim()) {
    alert('Post content cannot be empty');
    return;
  }

  const data = {
    content: newContent,
    imageUrl: post.imageUrl
  };

  this.postService.updatePost(post.id, data).subscribe({
    next: () => {
      post.content = newContent;
      this.loadPosts();
    },
    error: (err) => {
      console.log('Error editing post:', err);
    }
  });
}

deletePost(post: any): void {
  post.showMenu = false;

  const confirmDelete = confirm('Are you sure you want to delete this post?');

  if (!confirmDelete) {
    return;
  }

  this.postService.deletePost(post.id).subscribe({
    next: () => {
      this.posts = this.posts.filter(p => p.id !== post.id);
      this.loadCurrentUserProfile();
    },
    error: (err) => {
      console.log('Error deleting post:', err);
    }
  });
}

  
}
