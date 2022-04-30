import Sketch from 'react-p5'
import React from 'react'


export default function ImageHelper(lastTimeFed, noOfTimesFed) {
  const timeDifference = Date.now() - (lastTimeFed.lastTimeFed/1000000)
  const day = (timeDifference/1000)/86400
  const weight = lastTimeFed.noOfTimesFed/day
  console.log("weight: ", weight, day)

  const setup = (p5, canvasParentRef) => {
      p5.createCanvas(300, 250).parent(canvasParentRef)
    }
      
    const middle = 300/2;

    const draw = p5 => {
      p5.background(255, 222, 89)
      // p5.ellipse(middle, middle, weight*2, weight*4)
      p5.ellipse(300/2, 250/2, 100, 150)//body
      p5.ellipse(300/2, 50, 90)//head

      p5.ellipse(130, 50, 10)//eyes
      p5.ellipse(170, 50, 10).noStroke()

      p5.triangle(130, 60, 170, 60, 150, 80)//mouth

      p5.triangle(105, 50, 120, 20, 95, 10)//right ear
      p5.triangle(195, 50, 210, 12, 178, 17)//left ear

      p5.ellipse(120, 200, 50, 30)//right fore feet
      p5.ellipse(100, 190, 50, 30)//right hind feet

      p5.ellipse(170, 200, 50, 30)//left fore feet
      p5.ellipse(190, 190, 50, 30)//left hind feet

      p5.ellipse(130, 160, 30, 70)//right fore limb
      p5.ellipse(110, 160, 30, 50)//right hind limb

      p5.ellipse(170, 160, 30, 70)//left fore limb
      p5.ellipse(190, 160, 30, 50)//left hind limb
    }

    const styles = {
      "borderRadius": 10,
    }
    
    return <Sketch setup={setup} draw={draw} style={styles} />
}