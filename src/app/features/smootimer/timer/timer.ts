import { Component, HostListener, inject } from '@angular/core';
import { EventService } from './event.service';
import { TimerService } from './timer.service';
import { TimeDisplayPipe } from "../../../core/time-display-pipe";

@Component({
  selector: 'app-timer',
  imports: [TimeDisplayPipe],
  templateUrl: './timer.html',
  styleUrl: './timer.scss'
})
export class Timer {
  eventService = inject(EventService);
  timerService = inject(TimerService);
  timeCounter: number | any = 0;
  timing: boolean = false;
  timerRef: any;
  countdownRef: any;
  countdown = 15;
  countingDown: boolean = false;
  buttonText = 'Start';
  keyBuffer = false;
  countDownTimerEnabled: boolean = false;

  timerButtonClicked(): void {
    if (this.countDownTimerEnabled) {
      this.startCountdown();
    } else if (this.countingDown === true) {
      this.stopCountdown();
    } else if (!this.timing) {
      this.startTimer();
      this.keyBuffer = true;
    } else if (this.timing) {
      this.stopTimer();
      this.submitTime();
      this.keyBuffer = false;
    }
  }

  @HostListener('window:keyup', ['$event'])
  onKeyUp(event: KeyboardEvent): void {
    if (!this.timing && this.keyBuffer === false) {
      this.startTimer();
      this.keyBuffer = true;
    } else {
      this.keyBuffer = false;
    }
  }

  @HostListener('window:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    event.code === 'Space' && event.preventDefault();
    if (this.timing) {
      this.stopTimer();
      this.submitTime();
    }
  }

  startTimer(): void {
    this.timeCounter = 0;
    this.timing = true;
    this.buttonText = 'Stop';
    const startTime = Date.now() - (this.timeCounter || 0);
    this.timerRef = setInterval(() => {
      this.timeCounter = Date.now() - startTime;
    });
  }

  stopTimer(): void {
    this.timing = false;
    this.buttonText = 'Start';
    clearInterval(this.timerRef);
  }

  ngOnDestroy(): void {
    clearInterval(this.timerRef);
  }

  startCountdown(): void {
    this.countingDown = true;
    this.countdownRef = setInterval(() =>
    this.countdown = this.countdown - 1);
  }

  stopCountdown(): void {
    this.countingDown = false;
    clearInterval(this.countdownRef);
  }

  submitTime(): void {
    this.timerService.addSolve({
      time: this.timeCounter,
      event: this.eventService.currentEvent().title,
      solvedAt: new Date()
    });
  }

  deleteTime(id: bigint): void {
    this.timerService.deleteSolve(id);
  }

}
