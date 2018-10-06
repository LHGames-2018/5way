import { AIHelper } from '../helper/aiHelper';
import { Player, TileContent } from '../helper/interfaces';
import { Map } from '../helper/map';
import { Point } from '../helper/point';
import { randomIntFromInterval, researchClosestResource } from './randomizer';

export class Bot {
    protected playerInfo: Player;

    /**
     * Gets called before ExecuteTurn. This is where you get your bot's state.
     * @param  {Player} playerInfo Your bot's current state.
     * @returns void
     */
    public beforeTurn(playerInfo: Player): void {
        this.playerInfo = playerInfo;
    }
    /**
     * This is where you decide what action to take.
     * @param  {Map} map The gamemap.
     * @param  {Player[]} visiblePlayers The list of visible players.
     * @returns string The action to take(instanciate them with AIHelper)
     */
    public executeTurn(map: Map, visiblePlayers: Player[]): string {
        const resource = this.nextToResource(this.playerInfo.Position, map);
        if (resource) {
            return AIHelper.createCollectAction(resource);
        }

        const executeNearestResource = this.thinkNearestResource(map);
        if (executeNearestResource) {
            return executeNearestResource;
        }

        // Determine what action you want to take.
        return AIHelper.createMoveAction(randomIntFromInterval());
    }

    private thinkNearestResource(map: Map): string | undefined {
        const closestResource = researchClosestResource(map, this.playerInfo.Position);
        let move: Point;
        if (closestResource.x !== this.playerInfo.Position.x) {
            move = new Point((closestResource.x < this.playerInfo.Position.x) ? -1 : 1, 0);
        } else if (closestResource.y !== this.playerInfo.Position.y) {
            move = new Point(0, (closestResource.y < this.playerInfo.Position.y) ? -1 : 1);
        }
        if (map.getTileAt(this.addVectors(this.playerInfo.Position, move)) === TileContent.Wall) {
            return AIHelper.createAttackAction(move);
        }

        return AIHelper.createMoveAction(move);
    }

    private addVectors(point1: Point, point2: Point): Point {
        return new Point(point1.x + point2.x, point1.y + point2.y);
    }

    private nextToResource(position: Point, map: Map): Point | undefined {
        const attempts = [
            new Point(-1, 0),
            new Point(1, 0),
            new Point(0, -1),
            new Point(0, +1),
        ];

        attempts.forEach((attempt) => {
            if (map.getTileAt(new Point(position.x + attempt.x, position.y + attempt.y)) === TileContent.Resource) {
                return attempt;
            }
        });
        return;
    }

    private isFullCapacity(): boolean { //Checking if the capacity is full
        return this.playerInfo.CarriedResources > (this.playerInfo.CarryingCapacity * 0.9);
    }

    private returnHome(currentLocation: Point): Point {
        const houseCoords: Point = this.playerInfo.HouseLocation;
        const userX: Number = currentLocation.x;
        const userY: Number = currentLocation.y;
        const houseX: Number = houseCoords.x;
        const houseY: Number = houseCoords.y;
        var finalReturn: Point;

        if (userX < houseX) {
            return finalReturn = new Point(1, 0);
        }
        else if (userX > houseX) {
            return finalReturn = new Point(-1, 0);
        }

        if (userY < houseY) {
            return finalReturn = new Point(0, 1);
        }
        else if (userY < userY) {
            return finalReturn = new Point(0, -1);
        }

        return finalReturn = new Point(0, 0);

    }


    /**
     * Gets called after executeTurn
     * @returns void
     */
    public afterTurn(): void { }
}
