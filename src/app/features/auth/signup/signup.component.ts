import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-signup',
  standalone:false,
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent implements OnInit {
  signupForm!: FormGroup;
  loading = false;
  submitted = false;
  hidePassword = true;
  hideConfirmPassword = true;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    // Redirect si déjà connecté
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/products']);
      return;
    }

    this.signupForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      age: ['', [Validators.min(18), Validators.max(120)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  passwordMatchValidator(group: FormGroup) {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  get f() {
    return this.signupForm.controls;
  }

  onSubmit(): void {
    this.submitted = true;

    if (this.signupForm.invalid) {
      return;
    }

    this.loading = true;

    const { confirmPassword, ...signupData } = this.signupForm.value;

    this.authService.signup(signupData).subscribe({
      next: (response) => {
        this.toastr.success('Account created successfully!', 'Welcome');
        this.router.navigate(['/products']);
      },
      error: (error) => {
        this.toastr.error('Registration failed. Please try again.', 'Error');
        this.loading = false;
      }
    });
  }

  goToLogin(): void {
    this.router.navigate(['/auth/login']);
  }
}