import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../core/models/user';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-navbar',
  standalone:false,
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  currentUser$!: Observable<User | null>;
  currentUser: User | null = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentUser$ = this.authService.currentUser$;
    this.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  logout(): void {
    this.authService.logout();
  }

  navigateToProducts(): void {
    this.router.navigate(['/products']);
  }

  navigateToLogin(): void {
    this.router.navigate(['/auth/login']);
  }
}