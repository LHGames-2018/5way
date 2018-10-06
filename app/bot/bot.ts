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
        const resource = this.nextToResource(this.playerInfo.Position, map);
        console.log(this.playerInfo.CarryingCapacity);
        if (resource) {
            return AIHelper.createCollectAction(resource);
        }
        console.log("viarge4")
        const executeNearestResource = this.thinkNearestResource(map);
        if (executeNearestResource) {
            console.log(executeNearestResource);
            return executeNearestResource;
        }

        console.log("viarge5")
        // Determine what action you want to take.
        return AIHelper.createMoveAction(randomIntFromInterval());
    }

    private thinkNearestResource(map: Map): string | undefined {
        const closestResource = researchClosestResource(map, this.playerInfo.Position);
        let xMove = new Point(0, 0);
        let yMove = new Point(0, 0);
        if (closestResource.x !== this.playerInfo.Position.x) {
            xMove = new Point((closestResource.x < this.playerInfo.Position.x) ? -1 : 1, 0);
        } else if (closestResource.y !== this.playerInfo.Position.y) {
            yMove = new Point(0, (closestResource.y < this.playerInfo.Position.y) ? -1 : 1);
        }

        let move: Point;
        const takeX = Math.round(Math.random());
        if (takeX === 0) {
            move = xMove;
        } else {
            move = yMove;
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

        for (let i = 0; i < attempts.length; i++) {
            const attempt = attempts[i];
            if (map.getTileAt(new Point(position.x + attempt.x, position.y + attempt.y)) === TileContent.Resource) {
                return attempt;
            }
        }
        return;
    }

    private isFullCapacity(): boolean { //Checking if the capacity is full
        return this.playerInfo.CarriedResources > (this.playerInfo.CarryingCapacity * 0.9);
    }

    private returnHome(map: Map): string {
        let move: Point;

        if (this.playerInfo.HouseLocation.x !== this.playerInfo.Position.x) {
            move = this.fastestWayLeftRight(this.playerInfo.Position, this.playerInfo.HouseLocation);
        } else if (this.playerInfo.HouseLocation.y !== this.playerInfo.Position.y) {
            move = this.fastestWayTopBottom(this.playerInfo.Position, this.playerInfo.HouseLocation);
        }

        if (map.getTileAt(this.addVectors(this.playerInfo.Position, move)) === TileContent.Wall) {
            return AIHelper.createAttackAction(move);
        }

        return AIHelper.createMoveAction(move);
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
        const upgradeList = [{ type: UpgradeType.Defence, level: 1, cost: 10000 }, { type: UpgradeType.AttackPower, level: 1, cost: 10000 }, { type: UpgradeType.MaximumHealth, level: 1, cost: 10000 }, { type: UpgradeType.CarryingCapacity, level: 1, cost: 10000 }, { type: UpgradeType.CarryingCapacity, level: 2, cost: 15000 }, { type: UpgradeType.CollectingSpeed, level: 1, cost: 10000 }, { type: UpgradeType.Defence, level: 2, cost: 15000 }, { type: UpgradeType.AttackPower, level: 2, cost: 15000 }];
        if (((this.playerInfo.Position.x === this.playerInfo.HouseLocation.x) && (this.playerInfo.Position.y === this.playerInfo.HouseLocation.y))) {
            console.log("after house comparison");
            for (let i = 0; i < upgradeList.length; i++) {
                console.log(this.playerInfo.TotalResources);
                console.log(this.playerInfo.Defence);
                console.log(this.playerInfo.AttackPower);
                console.log(this.playerInfo.MaxHealth);
                if (this.playerInfo.TotalResources > upgradeList[i].cost) {
                  console.log("passed price check")
                    if (this.playerInfo.getUpgradeLevel(upgradeList[i].type) !== upgradeList[i].level) {
                        //do upgrade here
                        console.log(this.playerInfo.getUpgradeLevel(upgradeList[i].type) + "!==" + upgradeList[i].level);
                        console.log(upgradeList[i].type + "performed");
                        return AIHelper.createUpgradeAction(upgradeList[i].type);
                    }
                }

            }
        }
    }

    /**
     * Gets called after executeTurn
     * @returns void
     */
    public afterTurn(): void { }
}
