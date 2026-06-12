import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { PostService } from '../../services/post.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit {
  user: any = null;
  isLoading = true;

  isEditing = false;
  isSaving = false;
  errorMessage = '';

  editModel = {
    fullName: '',
    bio: ''
  };

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private postService: PostService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    const currentUser = this.authService.getCurrentUser();

    if (!currentUser || !currentUser.id) {
      this.router.navigate(['/login']);
      return;
    }

    this.userService.getUserById(currentUser.id).subscribe({
      next: (res) => {
        this.user = res;
        this.isLoading = false;
      },
      error: (err) => {
        console.log('Error loading profile:', err);
        this.isLoading = false;
      }
    });
  }

  startEdit(): void {
    this.errorMessage = '';
    this.editModel = {
      fullName: this.user?.fullName || '',
      bio: this.user?.bio || ''
    };

    this.isEditing = true;
  }

  cancelEdit(): void {
    this.isEditing = false;
    this.errorMessage = '';
  }

  saveProfile(): void {
    if (!this.editModel.fullName.trim()) {
      this.errorMessage = 'Name is required';
      return;
    }

    this.isSaving = true;
    this.errorMessage = '';

    const data = {
      fullName: this.editModel.fullName.trim(),
      bio: this.editModel.bio.trim()
    };

    /*
      لازم تضيف updateUser في UserService:
      updateUser(id: number, data: any) {
        return this.http.put(`${this.apiUrl}/users/${id}`, data);
      }
    */

    (this.userService as any).updateUser(this.user.id, data).subscribe({
      next: (res: any) => {
        this.user = {
          ...this.user,
          ...data,
          ...(res || {})
        };

        const currentUser = this.authService.getCurrentUser();

        if (currentUser) {
          localStorage.setItem('currentUser', JSON.stringify({
            ...currentUser,
            fullName: this.user.fullName,
            bio: this.user.bio
          }));
        }

        this.isEditing = false;
        this.isSaving = false;
      },
      error: (err: any) => {
        console.log('Error updating profile:', err);
        this.errorMessage = 'Could not update profile. Please try again.';
        this.isSaving = false;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }

  togglePostMenu(post: any): void {
    this.user.posts.forEach((p: any) => {
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
        this.user.posts = this.user.posts.filter((p: any) => p.id !== post.id);
      },
      error: (err) => {
        console.log('Error deleting post:', err);
      }
    });
  }
}
