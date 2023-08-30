import Npc from "./npc";
import Stat from "../values/rvals/stat";

export default class Minion extends Npc {

	toJSON(){

		let data = super.toJSON();

		data.level = this.level.value;
		data.exp = this.exp.value;

		return data;

	}

	get level() { return this._level; }
	set level(v) {

		this._level = v instanceof Stat ? v : new Stat(v)

	}

	/**
	 * @property {} exp
	*/
	get exp(){ return this._exp; }
	set exp(v) {

		if ( this._exp === undefined || this._exp === null ) this._exp = new Stat(v);
		else {

			this._exp.value = v;
			while ( this._next > 0 && this._exp.value >= this._next ) this.levelUp();

		}
	}

	/**
	 * @property {boolean} keep - whether to keep ally after combat.
	 */
	get keep(){return this._keep;}
	set keep(v) { this._keep = v;}

	constructor(vars, save=null ) {

		super( vars, save );

		/// experience to next level.
		this._next = 0;
		this.exp = 0;

		console.log('NEW MINION: ' + this.id );

		/*if ( this.alters ) {
			for( let p in this.alters ) {
				console.log('minion alter: ' + p + ": " + this.alters[p] );
			}
		}*/


	}

	revive(gs) {

		super.revive(gs);

		console.log('REVIVE MINION: ' + this.id );

		this.initAlters(gs);

	}

	/**
	 * Level up minion.
	 */
	levelUp(){
	}

}