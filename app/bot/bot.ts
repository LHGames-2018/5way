import { AIHelper } from '../helper/aiHelper';
import { Player, TileContent, UpgradeType } from '../helper/interfaces';
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
        /*if (this.playerInfo.HouseLocation.x !== this.playerInfo.Position.x) {
            return AIHelper.createMoveAction(new Point(1, 0));
        }*/

        const upgradePlayer = this.upgrade();
        if (upgradePlayer) {
            return upgradePlayer;
        }

        if (this.isFullCapacity()) {
            return this.returnHome(map);
        }

        const fight = this.fight(this.playerInfo.Position, map);
        if (fight) {
            return AIHelper.createAttackAction(fight);
        }

        const resource = this.nextToResource(this.playerInfo.Position, map);
        if (resource) {
            return AIHelper.createCollectAction(resource);
        }

        const executeNearestResource = this.thinkNearestResource(map);
        if (executeNearestResource) {
            return executeNearestResource;
        }

        // Determine what action you want to take.
        return this.buildMoveAction(randomIntFromInterval(), map);
    }

    private thinkNearestResource(map: Map): string | undefined {
        const closestResource = researchClosestResource(map, this.playerInfo.Position);
        if (!closestResource) {
            return;
        }
        const move = this.selectBestDirection(this.playerInfo.Position, closestResource);

        if (map.getTileAt(this.addVectors(this.playerInfo.Position, move)) === TileContent.Wall) {
            return AIHelper.createAttackAction(move);
        }

        return this.buildMoveAction(move, map);
    }

    private selectBestDirection(start: Point, end: Point): Point {
        let xMove = new Point(0, 0);
        let yMove = new Point(0, 0);
        if (end.x !== start.x) {
            xMove = this.fastestWayLeftRight(start, end);
        }
        if (end.y !== start.y) {
            yMove = this.fastestWayTopBottom(start, end);
        }

        let move: Point;
        const takeX = Math.round(Math.random());
        if ((takeX === 0 && xMove.x) || yMove.y === 0) {
            move = xMove;
        } else {
            move = yMove;
        }

        return move;
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

        for (let i = 0; i < attempts.length; i++) {
            const attempt = attempts[i];
            if (map.getTileAt(new Point(position.x + attempt.x, position.y + attempt.y)) === TileContent.Resource) {
                return attempt;
            }
        }
        return;
    }

    private isFullCapacity(): boolean { //Checking if the capacity is full
        return this.playerInfo.CarriedResources >= this.playerInfo.CarryingCapacity;
    }

    private returnHome(map: Map): string {
        const move = this.selectBestDirection(this.playerInfo.Position, this.playerInfo.HouseLocation);

        if (map.getTileAt(this.addVectors(this.playerInfo.Position, move)) === TileContent.Wall) {
            return AIHelper.createAttackAction(move);
        }

        return this.buildMoveAction(move, map);
    }

    private obstacleChecker(nextMoveCoord: Point, map: Map): boolean { //Returns true if there is no obstacle at next move
        const nextMoveContent: TileContent = map.getTileAt(nextMoveCoord);
        if (nextMoveContent === TileContent.Resource || nextMoveContent === TileContent.House || nextMoveContent === TileContent.Shop || nextMoveContent === TileContent.Lava) {
            return false;
        }
        return true;
    }

    private safetyChecker(currentCoord: Point, direction: Point, map: Map): Point {
        const nextMoveCoord = this.addVectors(currentCoord, direction);
        const potentialNextCoordRight: Point = new Point(currentCoord.x + 1, currentCoord.y);
        const potentialNextCoordLeft: Point = new Point(currentCoord.x - 1, currentCoord.y);
        const potentialNextCoordDown: Point = new Point (currentCoord.x, currentCoord.y + 1);
        const potentialNextCoordUp: Point = new Point (currentCoord.x, currentCoord.y - 1);

        if (nextMoveCoord.x === this.playerInfo.HouseLocation.x && nextMoveCoord.y === this.playerInfo.HouseLocation.y) {
            return nextMoveCoord;
        } else if (direction.x === 0 && direction.y === -1 && !this.obstacleChecker(nextMoveCoord, map)) { //Tries to go up
            if (this.obstacleChecker(potentialNextCoordRight, map)) {
                return potentialNextCoordRight;
            } else if (this.obstacleChecker(potentialNextCoordLeft, map)) {
                return potentialNextCoordLeft;
            } else if (this.obstacleChecker(potentialNextCoordDown, map)) {
                return potentialNextCoordDown;
            }
        } else if (direction.x === 0 && direction.y === 1 && !this.obstacleChecker(nextMoveCoord, map)) { //Tries to go down
            if (this.obstacleChecker(potentialNextCoordRight, map)) {
                return potentialNextCoordRight;
            } else if (this.obstacleChecker(potentialNextCoordLeft, map)) {
                return potentialNextCoordLeft;
            } else if (this.obstacleChecker(potentialNextCoordUp, map)) {
                return potentialNextCoordUp;
            }
        } else if (direction.x === -1 && direction.y === 0 && !this.obstacleChecker(nextMoveCoord, map)) { // Tries to left
            if (this.obstacleChecker(potentialNextCoordUp, map)) {
                return potentialNextCoordUp;
            } else if (this.obstacleChecker(potentialNextCoordDown, map)) {
                return potentialNextCoordDown;
            } else if (this.obstacleChecker(potentialNextCoordRight, map)) {
                return potentialNextCoordRight;
            }
        } else if (direction.x === 1 && direction.y === 0 && !this.obstacleChecker(nextMoveCoord, map)) { //Tries to go right
            if (this.obstacleChecker(potentialNextCoordUp, map)) {
                return potentialNextCoordUp;
            } else if (this.obstacleChecker(potentialNextCoordDown, map)) {
                return potentialNextCoordDown;
            } else if (this.obstacleChecker(potentialNextCoordLeft, map)) {
                return potentialNextCoordLeft;
            }
        }
        return nextMoveCoord;
    }

    private fastestWayLeftRight(start: Point, end: Point): Point {
        return new Point(this.fastestWayAgnostic(start.x, end.x, Map.MAX_X), 0);
    }

    private fastestWayTopBottom(start: Point, end: Point): Point {
        return new Point(0, this.fastestWayAgnostic(start.y, end.y, Map.MAX_Y));
    }

    private fastestWayAgnostic(start: number, end: number, max: number): number {
        //Looparound distance is (sizeOfMap - start + end)
        const looparoundDistance = max - Math.max(start, end) + Math.min(start, end);

        //Normal distance is (end - end)
        const normalDistance = Math.abs(end - start);

        if (looparoundDistance < normalDistance) {
            return (start - end) / Math.abs(start - end);
        }
        return (end - start) / Math.abs(end - start);
    }

    private upgrade() {
        const upgradeList = [{ type: UpgradeType.AttackPower, level: 1, cost: 10000 },{ type: UpgradeType.AttackPower, level: 2, cost: 15000 },{ type: UpgradeType.AttackPower, level: 3, cost: 25000 },{ type: UpgradeType.Defence, level: 1, cost: 10000 },{ type: UpgradeType.Defence, level: 2, cost: 15000 },{ type: UpgradeType.Defence, level: 3, cost: 25000 }, { type: UpgradeType.CarryingCapacity, level: 1, cost: 10000 }, { type: UpgradeType.CarryingCapacity, level: 2, cost: 15000 },{ type: UpgradeType.CollectingSpeed, level: 1, cost: 10000 },{ type: UpgradeType.CollectingSpeed, level: 2, cost: 15000 },{ type: UpgradeType.Defence, level: 1, cost: 10000 }, { type: UpgradeType.AttackPower, level: 1, cost: 10000 }, { type: UpgradeType.MaximumHealth, level: 1, cost: 10000 }, { type: UpgradeType.CarryingCapacity, level: 3, cost: 25000 }, { type: UpgradeType.CollectingSpeed, level: 3, cost: 25000 }];
        if (((this.playerInfo.Position.x === this.playerInfo.HouseLocation.x) && (this.playerInfo.Position.y === this.playerInfo.HouseLocation.y))) {
            for (let i = 0; i < upgradeList.length; i++) {
                if (this.playerInfo.TotalResources > upgradeList[i].cost) {
                    console.log("total ressources: " + this.playerInfo.TotalResources + "upgrade log: " + upgradeList[i]);
                    console.log("carrying capacity: "+ this.playerInfo.CarryingCapacity);
                    console.log("collecting speed: "+ this.playerInfo.CollectingSpeed);          
                    if (this.playerInfo.getUpgradeLevel(upgradeList[i].type) < upgradeList[i].level) {
                        return AIHelper.createUpgradeAction(upgradeList[i].type);
                    }
                }
            }
        }
    }

    private fight(position: Point, map: Map): Point | undefined {
        const attempts = [
            new Point(-1, 0),
            new Point(1, 0),
            new Point(0, -1),
            new Point(0, +1),
        ];

        for (let i = 0; i < attempts.length; i++) {
            const attempt = attempts[i];
            if (map.getTileAt(new Point(position.x + attempt.x, position.y + attempt.y)) === TileContent.Player) {
                return attempt;
            }
        }
        return;
    }

    private buildMoveAction(move: Point, map: Map): string {
        const whereToGo = this.safetyChecker(this.playerInfo.Position, move, map);
        const bestMove = new Point(whereToGo.x - this.playerInfo.Position.x, whereToGo.y - this.playerInfo.Position.y);
        return AIHelper.createMoveAction(bestMove);
    }

    /**
     * Gets called after executeTurn
     * @returns void
     */
    public afterTurn(): void { }
}
