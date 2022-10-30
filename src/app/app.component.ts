import { Component, ElementRef, ViewChild } from '@angular/core';
import { EventManager } from '@angular/platform-browser';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  @ViewChild('main', { static: false }) public main: ElementRef | undefined;
  title = 'AngularSnakeGame';
  whenEat = new Audio('../assets/eat.wav');
  whenCollide = new Audio('../assets/collision.wav');
  runningNoise = new Audio('../assets/noise.wav');
  whenSnakeMove = new Audio('../assets/snakeMove.wav');
  lastTime: number = 0;
  speed: number = 5;
  snakeBody: Array<any> = [{ x: 10, y: 12 }];
  food: any = {}
  inputDir: any = {};
  score: number = 0;
  highScore: number = 10;

  constructor(public eventManager: EventManager) {
    this.eventManager.addGlobalEventListener('document', 'keydown', ((e: any) => { this.keyHandler(e) }));
  }

  ngOnInit() {
    this.food = { x: 5, y: 6 };
    this.inputDir = { x: 0, y: 0 };
    this.runningNoise.volume = 0.1;
    this.whenEat.volume = 1
    this.whenSnakeMove.volume = 0.2;
    this.whenSnakeMove.playbackRate = 3;
    this.whenCollide.playbackRate = 1.75;
    let highScore = localStorage.getItem('highScore')
    if (highScore != null) {
      this.highScore = JSON.parse(highScore)
    }
    setInterval(() => {
      this.requestFrame();
    }, 0);
  }


  requestFrame() {
    let time = new Date().getTime()
    requestAnimationFrame(() => this.gameStart(time));
  }

  gameStart(curTime: number) {
    // Speed control
    if ((curTime - this.lastTime) / 1000 < 1 / this.speed) {
      return
    }
    this.lastTime = curTime;

    this.gameLogic();
    // this.requestFrame();
  }

  gameLogic() {
    //collision handling
    if (this.isCollision(this.snakeBody)) {
      this.inputDir = { x: 0, y: 0 };
      alert("Haha you lose! Do you want to take challenge again?");
      this.snakeBody = [{ x: 10, y: 11 }];
      this.runningNoise.play();
      this.runningNoise.loop = true;
      this.score = 0;
    }

    //score calculation
    if (this.snakeBody[0].y === this.food.y && this.snakeBody[0].x === this.food.x) {
      this.whenEat.play();
      this.score += 1;
      if (this.score > this.highScore) {
        this.highScore = this.score;
        localStorage.setItem('highScore', JSON.stringify(this.highScore));
        if(this.score >= 10 && this.score < 20){
          this.speed = 10;
        }

        if(this.score >= 20){
          this.speed = 15;
        }
      }
      this.whenEat.pause();

      this.snakeBody.unshift({ x: this.snakeBody[0].x + this.inputDir.x, y: this.snakeBody[0].y + this.inputDir.y });
      let a = 2;
      let b = 16;
      this.food = { x: Math.round(a + (b - a) * Math.random()), y: Math.round(a + (b - a) * Math.random()) }
    }

    for (let i = this.snakeBody.length - 2; i >= 0; i--) {
      this.snakeBody[i + 1] = { ...this.snakeBody[i] };
    }

    this.snakeBody[0].x += this.inputDir.x;
    this.snakeBody[0].y += this.inputDir.y;

    let mainBody = document.getElementById('main') as HTMLElement;
    mainBody.innerHTML = '';
    this.snakeBody.forEach((j, index) => {
      let snakeAppearance = document.createElement('div');
      snakeAppearance.style.gridRowStart = j.y;
      snakeAppearance.style.gridColumnStart = j.x;

      if (index === 0) {
        snakeAppearance.classList.add('head');
      }
      else {
        snakeAppearance.classList.add('snakeBody');
      }
      mainBody.appendChild(snakeAppearance);
    })

    let frogElement = document.createElement('div');
    frogElement.style.gridRowStart = this.food.y;
    frogElement.style.gridColumnStart = this.food.x;
    frogElement.classList.add('food')
    mainBody.appendChild(frogElement);

  }

  isCollision(arr: any[]) {
    // If you collide wih your own body
    for (let i = 1; i < this.snakeBody.length; i++) {
      if (arr[i].x === arr[0].x && arr[i].y === arr[0].y) {
        this.runningNoise.pause();
        this.whenCollide.play();
        return true;
      }
    }
    // collide with wall
    if (arr[0].x >= 18 || arr[0].x <= 0 || arr[0].y >= 18 || arr[0].y <= 0) {
      this.runningNoise.pause();
      this.whenCollide.play();
      return true;
    }

    return false;
  }

  keyHandler(e: any) {
    this.runningNoise.play();
    this.runningNoise.loop = true;
    this.whenSnakeMove.play();

    switch (e.key) {
      case "ArrowUp":
        this.inputDir.x = 0;
        this.inputDir.y = -1;
        break;

      case "ArrowDown":
        this.inputDir.x = 0;
        this.inputDir.y = 1;
        break;

      case "ArrowLeft":
        this.inputDir.x = -1;
        this.inputDir.y = 0;
        break;

      case "ArrowRight":
        this.inputDir.x = 1;
        this.inputDir.y = 0;
        break;

      default:
        break;
    }

  }


}
