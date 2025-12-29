import { Injectable } from '@angular/core';

const testUsers = [
  { id: 1, name: 'Mitch',   email: 'mitch@example.com', score: 100, friendIds: [2, 3, 4], records: [{event: '2x2', time: 2000, average: 2500}, {event: '3x3', time: 15000, average: 18000}, {event: 'Megaminx', time: 30000, average: 35000}] },
  { id: 2, name: 'Gavin',   email: 'gavin@example.com', score: 80, friendIds: [1, 3] },
  { id: 3, name: 'Charlie', email: 'charlie@example.com', score: 130, friendIds: [1, 2, 5] },
  { id: 4, name: 'Alice',   email: 'alice@example.com', score: 90, friendIds: [1, 5] },
  { id: 5, name: 'Kevin',   email: 'kevin@example.com', score: 70, friendIds: [3, 4] },
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
