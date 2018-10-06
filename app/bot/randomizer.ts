import { Point } from '../helper/point';
import { Map } from '../helper/map';
import { TileContent } from '../helper/interfaces';

export function randomIntFromInterval(min = 1,max = 4) // min and max included
{
    let direction = Math.floor(Math.random()*(max-min+1)+min);
    if (direction == 1){ //up
        return new Point(0,-1);
    }else if (direction == 2){ //right
        return new Point(1,0);
    }else if (direction == 3) { //down
        return new Point(0,1);
    }else { //left
        return new Point(-1,0); 
    }
}


export function distance(point1: Point, point2: Point) {
    const distanceX = Math.abs(point1.x - point2.x);
    const distanceY = Math.abs(point1.y - point2.y);
    return distanceX + distanceY;
 }

export function ResearchClosestResource(map: Map, point: Point){
   let closestResourceItemLocation; 
   let smallestDistance = 99999999999999999999999;
    for (let x = map.xMin; x < map.xMax; x++) {
        for (let y = map.yMin; y < map.yMax; y++) {
            if (map.getTileAt(new Point(x, y)) === TileContent.Resource) {
                let itemLocation = map.getTileAt(new Point(x,y));
                if(distance(point,new Point(x,y)) < smallestDistance){
                    smallestDistance = distance(point, new Point(x,y));
                    closestResourceItemLocation = new Point(x,y);                    
                }
            }
        }
    }
    return closestResourceItemLocation;
}