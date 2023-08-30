import InstMod from "../values/mods/instMod";
import { MakeStat } from "../values/mods/mod";
import { canWriteProp } from "../util/util";

/**
 * Counts number of times a data item has been applied to an Instanced object.
 */
export default class Alter {

	toJSON(){return this.count;}

	/**
	 * @property {number} count
	 */
	get count(){return this._count;}
	set count(v){this._count=v}

	/**
	 * @property {string} id
	 */
	get id(){return this._id;}
	set id(v){this._id = v;}

	/**
	 * @property {InstMod[]} mods - array of mods applied by this Alteration.
	 */
	get mods(){return this._mods};
	//set mods(v){this._mods=v;}

	/**
	 *
	 * @param {Property} prop - property containing the alter.
	 * @param {number} count
	 */
	constructor( prop, count=1 ){

		this.prop = prop;
		this.count = count;
		this._mods = [];

	}

	/**
	 * Reapply alter with new count.
	 * @param {number} delta - change in current value.
	 */
	update( delta ){

		this.count += delta;

		if ( this.count == 0 ) {
			// remove all
		}

		for( let i = this.mods.length-1; i >= 0; i-- ) {

			//console.log( this.mods[i].target.id + ' reapply: ' + this.mods[i].id );

			this.mods[i].reapply(this.count);
		}
	}

	/**
	 * Initialize the alter mods for the given target.
	 * @param {GData} targ
	 */
	init( targ ){

		this.makeInstances( this.prop.alter, targ );
		this.update(0);
	}

	/**
	 * Create instance mods for every alteration target.
	 * @param {object} alters
	 * @param {object} targ - current target.
	 */
	makeInstances( alters, targ, isMod=false ){

		if ( alters == null ) return;

		for( let p in alters ){

			let curTarg = targ[p];

			if( !canWriteProp(targ, p ) ) continue;

			let curAlter = alters[p];
			if ( typeof curAlter === 'object' ) {

				if ( curAlter.constructor === Object ) {

					this.makeInstances( curAlter, curTarg || (targ[p]={}), isMod||(p==='mod') );

				} else {
					// m is mod.
					if ( !curTarg || typeof curTarg === 'number') {
						//console.log(this.prop.id + ' ALTER NEW STAT: ' + p );
						curTarg = MakeStat( targ, p, null, isMod||p=='mod');
					}
					curAlter = new InstMod( curAlter, this.count, curTarg );
					this._mods.push(curAlter);

				}

			}

		}

	}

}
