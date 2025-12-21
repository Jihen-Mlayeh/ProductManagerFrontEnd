import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class SetupUsersService {

  private testUsers = [
    { name: 'Admin User', email: 'admin@productmanager.com', password: 'admin123', age: 30 },
    { name: 'Browser User', email: 'browser@productmanager.com', password: 'browse123', age: 25 },
    { name: 'Creator User', email: 'creator@productmanager.com', password: 'create123', age: 28 },
    { name: 'Deleter User', email: 'deleter@productmanager.com', password: 'delete123', age: 32 },
    { name: 'Error User', email: 'error@productmanager.com', password: 'error123', age: 27 },
    { name: 'Regular User', email: 'regular@productmanager.com', password: 'regular123', age: 29 }
  ];

  constructor(
    private authService: AuthService,
    private toastr: ToastrService
  ) {}

  async createAllTestUsers(): Promise<void> {
    console.log('🚀 Creating test users...');
    
    let created = 0;
    let alreadyExists = 0;

    for (const user of this.testUsers) {
      try {
        await this.authService.signup({
          name: user.name,
          email: user.email,
          password: user.password,
          age: user.age
        }).toPromise();
        
        console.log(`✅ Created: ${user.email}`);
        created++;
      } catch (error: any) {
        if (error.status === 400 || error.error?.message?.includes('already exists')) {
          console.log(`ℹ️ Already exists: ${user.email}`);
          alreadyExists++;
        } else {
          console.error(`❌ Failed to create ${user.email}:`, error);
        }
      }
    }

    console.log(`\n📊 Summary:`);
    console.log(`   ✅ Created: ${created}`);
    console.log(`   ℹ️ Already existed: ${alreadyExists}`);
    console.log(`   📝 Total: ${this.testUsers.length}`);

    this.toastr.success(`Test users ready! (${created} created, ${alreadyExists} already existed)`, 'Setup Complete');
  }
}