import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-login',
  standalone:false,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  loading = false;
  submitted = false;
  hidePassword = true;
  returnUrl: string = '/products';

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    // Redirect si déjà connecté
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/products']);
      return;
    }

    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    // Get return url from route parameters or default to '/products'
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/products';
  }

  get f() {
    return this.loginForm.controls;
  }

  onSubmit(): void {
    this.submitted = true;

    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;

    this.authService.login(this.loginForm.value).subscribe({
      next: (response) => {
        this.toastr.success('Welcome back!', 'Login Successful');
        this.router.navigate([this.returnUrl]);
      },
      error: (error) => {
        this.toastr.error('Invalid email or password', 'Login Failed');
        this.loading = false;
      }
    });
  }

  goToSignup(): void {
    this.router.navigate(['/auth/signup']);
  }
}