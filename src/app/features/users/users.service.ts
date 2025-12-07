import { Injectable } from '@angular/core';

const testUsers = [
  { id: 1, name: 'Mitch',   email: 'mitch@example.com', score: 100 },
  { id: 2, name: 'Gavin',   email: 'gavin@example.com', score: 80 },
  { id: 3, name: 'Charlie', email: 'charlie@example.com', score: 130 },
];


@Injectable({
  providedIn: 'root'
})
export class UsersService {

  getUsers() {
    return testUsers;
  }

  getUserProfile(id: number | undefined) {
    return new Promise((resolve) => {
      const user = testUsers.find(u => u.id === id);
      setTimeout(() => {
        resolve(user);
      }, 100);
    });
  }
}
