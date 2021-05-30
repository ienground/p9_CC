/**
 * Developed by IENGROUND of ienlab.
 * @ienground_
 * Ericano Rhee on github.com/ienground
 */

class Rock {
    bgColor = '#6F163E';
    isBurn = false;
    isExplode = false;
    isTraceEnd = false;
    burnFrame = -1;
    traceX = [];
    traceY = [];

    constructor(x, y, size, velocity) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.velocity = velocity;
    }

    draw() {
        push();

        for (let i = 0; i < this.traceX.length; i++) {
            fill(100,10, 50, 20 + i / 2);
            circle(this.traceX[i], this.traceY[i], this.size);
        }

        fill(this.bgColor);

        if (!this.isExplode) {
            circle(this.x, this.y, this.size);
            this.traceX.push(this.x);
            this.traceY.push(this.y);
        }

        if (this.traceX.length > 80 || (this.x < -10 && this.traceX.length > 0) || this.isBurn) {
            this.traceX.splice(0, 1);
            this.traceY.splice(0, 1);
        }

        if (this.traceX.length === 0) {
            this.isTraceEnd = true;
        }

        pop();
    }

    move() {
        this.x -= this.velocity;
        this.y += this.velocity;
    }

    explode(frame) {
        let frameGap = frame - this.burnFrame;

        fill('#6F163E');
        if (frameGap * 2 <= this.size) {
            circle(this.x, this.y, frameGap * 2)
        } else {
            this.isExplode = true;
        }
    }

    burn(frame) {
        this.bgColor = '#ff0000';
        // this.Color = '#ce4319';
        this.isBurn = true;
        this.burnFrame = frame;
    }
}

let familyCount = 5;
let lostFamily = [];
let lostFrame = [];
let lostPoint = [];
let lostExplode = [];
let barrierRadius = 200; // 100 ~ 400
let selectedItem = -1;

let rockPositionX = [];
let rockPositionY = [];
let rocks = [];

let cam;

function setup() {
    createCanvas(windowWidth, windowHeight);
    angleMode(DEGREES);
    colorMode(RGB);

    cam = createCapture(VIDEO);

    // filter(INVERT);
    cam.hide();

    background(255);

    fill(0);
    noStroke();

    textAlign(CENTER);

    for (let i = 0; i < 4; i++) {
        let rock = new Rock(getRandomInt(0, width * 1.5), -40, getRandomInt(50, 100), random(1, 3));
        rocks.push(rock);
    }
}

function draw() {
    background('#310B22');
    cam.loadPixels();

    for (let i = 0; i < cam.width; i += 10) {
        for (let j = 0; j < cam.height; j += 10) {
            let id = (i + cam.width * j) * 4;
            let r = cam.pixels[id];
            let g = cam.pixels[id + 1];
            let b = cam.pixels[id + 2];


            let c = lerpColor(color('#310B22'), color('#260a1b'), (r + 50) * (g + 50) * (b + 50) / (255 * 255 * 255));
            push();
            translate(width - i * width / cam.width, j * height / cam.height);
            fill(c);
            circle(0, 0, 60);
            pop();
        }
    }

    fill(255);
    noStroke();

    for (let i = 0; i < rocks.length; i++) {
        if (!rocks[i].isBurn) {
            rocks[i].move();
        }
        rocks[i].draw();

        if (dist(width / 2, height / 2, rocks[i].x, rocks[i].y) <= barrierRadius) {
            if (!rocks[i].isBurn) {
                // 확률 적용
                if (400 - getRandomInt(100, barrierRadius) >= 280) {
                    rocks[i].burn(frameCount);
                }
            }
        }

        if (rocks[i].isBurn && !rocks[i].isExplode) {
            rocks[i].explode(frameCount);
        }

        if (rocks[i].isTraceEnd) {
            rocks.splice(i, 1);
        }
    }

    if (frameCount % 60 * 5 === 0) {
        for (let i = 0; i < 3; i++) {
            let rock = new Rock(getRandomInt(0, width * 1.5), -40, getRandomInt(50, 100), random(1, 3));
            rocks.push(rock);
        }
    }

    fill(255);
    push();
    translate(width / 2, height / 2);
    rotate(frameCount / 2);
    for (let i = 0; i < 360; i++) {
        if ((i % 30 <= 20) && (i % 30 >= 0)) {
            circle(barrierRadius * cos(i), barrierRadius * sin(i), 10);
        }
    }
    pop();

    for (let i = 0; i < familyCount; i++) {
        let circleX = width / 2 + barrierRadius / 2 * cos(360 / familyCount * i + frameCount);
        let circleY = height / 2 + barrierRadius / 2 * sin(360 / familyCount * i + frameCount);
        let circleR = 30;

        if (mouseIsPressed
            && (dist(circleX, circleY, mouseX, mouseY) <= circleR)
            && selectedItem === -1) {
            selectedItem = i;
        } else if (!mouseIsPressed) {
            selectedItem = -1;
        }
    }

    for (let i = 0; i < familyCount; i++) {
        push();
        translate(width / 2, height / 2);
        rotate(frameCount);

        let c = color(255 / familyCount * i, 255 - 255 / familyCount * i, 200);
        let cTransparent = color(255 / familyCount * i, 255 - 255 / familyCount * i, 200, 50);
        let circleX = barrierRadius / 2 * cos(360 / familyCount * i);
        let circleY = barrierRadius / 2 * sin(360 / familyCount * i);
        let circleR = 30;

        noFill();
        stroke(cTransparent);
        strokeWeight(10);
        circle(circleX, circleY, circleR * 2 - 10);

        noStroke();
        fill(c);
        if (!lostFamily.includes(i)) {
            if (selectedItem === i) {
                pop();

                noStroke();
                fill(c);
                circle(mouseX, mouseY, circleR * 2);

                if (dist(mouseX, mouseY, width / 2, height / 2) >= barrierRadius * 1.5) {
                    if (!lostFamily.includes(i)) {
                        let p = { x : mouseX, y : mouseY };

                        lostFamily.push(i);
                        lostFrame.push(frameCount);
                        lostPoint.push(p);
                        print(lostFamily);
                    }
                }
            } else {
                circle(circleX, circleY, circleR * 2);
                pop();
            }
        } else {
            pop();

            push();
            let index = lostFamily.indexOf(i);

            if (!lostExplode[index]) {
                translate(lostPoint[index].x, lostPoint[index].y);
                fill(c);
                circle(0, 0, circleR * 2);
                let frameGap = frameCount - lostFrame[index];

                fill('#310B22');
                if (frameGap <= circleR) {
                    circle(0, 0, frameGap * 2)
                } else {
                    lostExplode[index] = true;
                }
            }

            pop();
        }
    }


}

function getInverseColor(colorString) {
    let c = color(colorString);
    let r = 255 - red(c);
    let g = 255 - green(c);
    let b = 255 - blue(c);

    return color(r, g, b);
}

function mouseWheel(event) {
    if (event.delta < 0  && barrierRadius < 400) {
        barrierRadius += 2;
    } else if (event.delta > 0 && barrierRadius > 100) { // minimum barrier radius 70
        barrierRadius -= 2;
    }
}

function keyPressed(key) {
    switch (key.key) {

    }
}

function getRandomInt(min, max) {
    return Math.floor(random(min, max + 1));
}