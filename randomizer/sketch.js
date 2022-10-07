let colors = ["red","orange","yellow","green","blue","purple"];

function setup(){
  createCanvas(600,600);
  background(200);

  console.log("initial array is ");
  console.log(colors);


  colors.pop();
  console.log("array after pop");
  console.log(colors);

  colors.push();
  console.log("array after push");
  console.log(colors);

}

function draw(){

}
