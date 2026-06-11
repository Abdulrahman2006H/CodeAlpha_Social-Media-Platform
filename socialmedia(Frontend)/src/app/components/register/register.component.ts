import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  fullName = '';
  userName = '';
  email = '';
  password = '';
  bio = '';

  errorMessage = '';
  isLoading = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  register(): void {
    this.errorMessage = '';

    if (
      !this.fullName.trim() ||
      !this.userName.trim() ||
      !this.email.trim() ||
      !this.password.trim()
    ) {
      this.errorMessage = 'Please fill all required fields';
      return;
    }

    this.isLoading = true;

    this.authService.register({
      fullName: this.fullName,
      userName: this.userName,
      email: this.email,
      password: this.password,
      bio: this.bio,
      profileImage: `https://i.pravatar.cc/150?u=${this.email}`,
      coverImage: ''
    }).subscribe({
      next: () => {
        this.isLoading = false;
        alert('Registration successful');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error || 'Something went wrong';
      }
    });
  }
}