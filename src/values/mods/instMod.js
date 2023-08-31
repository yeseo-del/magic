import RValue from "../rvals/rvalue";

/**
 * Matches a mod with a custom count so instanced items
 * can have their own mod numbers.
 */
export default class InstMod extends RValue {

	/**
	 * Store count only.
	 */
	toJSON(){
		return this.count;
	}

	/**
	 * @property {Stat} target - target of mod for
	 * easy update.
	 */
	set target(v) { this._target=v}
	get target(){
		return this._target;
	}

	/**
	 * @property {Mod} mod - base mod being applied
	 * with custom count.
	 */
	get mod(){ return this._mod }
	set mod(v){this._mod = v}

	get count(){return this._count;}
	set count(v){this._count=v}

	/**
	 * @property {number} basePct - decimal percent
	 */
	get basePct() { return this.mod.basePct; }
	set basePct(v) { this.mod.basePct = v; }

	/**
	 * @property {number} bonus - bonus of mod after percent mods.
	 * basePct not added because basePct works on target of mod.
	 */
	get bonus(){return this.mod.bonus }

	/**
	 * @property {number} pctBonus - modified percent bonus of mod.
	 */
	get pctBonus(){return this.mod.pctBonus }

	/**
	 * @property {number} countPct - base percent multiplied by number of times
	 * mod is applied.
	 */
	get countPct(){return this.mod.pctBonus*this.count;}

	/**
	 * @property {number} bonusTot - base bonus multiplied by number of times
	 * mod is applied.
	 */
	get countBonus(){return this.mod.bonus*this.count;}

	/**
	 * @property {string} type
	 */
	get type(){ return TYP_MOD }

	/**
	 *
	 * @param {Mod} mod
	 * @param {number} count
	 * @param {object} targ
	 */
	constructor( mod, count=1, targ=null ){

		super( null, mod.id );

		if ( targ === null ) console.warn('MISSING INST MOD TARG: ' + this.id );

		this.mod = mod;
		this.target = targ;
		this.count = count;

	}

	/**
	 * Reapply mod with updated count.
	 * @param {number} count
	 */
	reapply(count) {

		if ( !this.target ) {
			console.warn(this.id + ' INVALID MOD TARG: ' + this.target );
			return;
		} else if ( !this.target.addMod) {
			console.warn( this.id + ' INVALID MOD TARGET: ' + (this.target.constructor.name));
			return;
		}

		this.count = count;
		this.target.addMod( this );

	}

}