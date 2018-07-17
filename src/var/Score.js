export class Score {
  constructor() {
    this.invaders = 0;
    this.wood = 0;
    this.creeps = 0;
    this.treasures = 0;
    this.bosses = 0;
    this.colonists = 0;
    this.soldiers = 0;
    this.unusedWood = 0;

    this.scorePerInvader = 2;
    this.scorePerWood = 1;
    this.scorePerCreep = 1;
    this.scorePerTreasure = 100;
    this.scorePerBoss = 100;
    //no score for units produced


    this.debug = true;

    console.log("debug mode");

  }
  getScore() {
  	return (this.invaders*this.scorePerInvader) + 
  		(this.unusedWood*this.scorePerWood) + 
  		(this.creeps*this.scorePerCreep) + 
  		(this.treasures*this.scorePerTreasure) + 
  		(this.bosses*this.scorePerBoss);
  }
}
