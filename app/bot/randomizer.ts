import { Point } from '../helper/point';

export function randomIntFromInterval(min = 1,max = 4) // min and max included
{
    let direction = Math.floor(Math.random()*(max-min+1)+min);
    console.log(direction);    
    if (direction == 1){ //up
        return new Point(0,-1);
    }else if (direction == 2){ //right
        return new Point(1,0);
    }else if (direction == 3) { //down
        return new Point(0,1);
    }else if (direction == 4){ //left
        return new Point(-1,0); 
    }else{
        console.log("randomizer error");
    }
}