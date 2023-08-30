import InstMod from "../values/mods/instMod";
import Alter from "./alter";
import Property from "../chars/property";

/**
 * Functions/properties shared by instances.
 */
export default {

	get instanced() { return true; },

	/**
	 * @property {string} recipe - id of item template used to instance this item.
	 */
	get recipe() { return this.template?  this.template.id : this._id; },
	set recipe(v) { if ( !this.template ) this.template = v},

	get template(){ return this._template;},
	set template(v){this._template=v;},

	get mod(){return this._mod;},
	set mod(v){this._mod =v;},

	/**
	 * @property {object<string,Alter>} alters - maps ids of alter objects
	 * to information about alteration counts.
	 */
	get alters(){ return this._alters; },
	set alters(v){ this._alters=v; },

	/**
	 * Map property strings to source property objects
	 * and apply fundamental alterations.
	 */
	initAlters( g ){

		let alters = this.alters || {};
		if ( typeof alters === 'string' || Array.isArray(alters)) {

			// @compat Array.
			let a = typeof alters === 'string' ? alters.split(',') : alters;
			alters = this.alters = {};
			for( let p of a ) {
				a[p] = 1;
			}

		}

		for( let p in alters ) {

			let it = g.getData( p );

			let count = alters[p] || 1;

			if (!it || (typeof it !== 'object') || !it.alter ) {

				console.warn( this.id + ' missing alter: ' + p );

			} else {

				this.newAlter( it, count );

			}

		}

	},

	/**
	 * Add alteration to instance.
	 * @param {Property} prop - property with 'alter'
	 * @param {number} [amt=1] - amount to add/subtract.
	 */
	doAlter( prop, amt=1 ) {

		if (!prop) {
			console.log('NO ALTER. NULL RETURN');
			return;
		}

		if ( !this.alters ) this.alters = {};

		let alter = this.alters[prop.id ];
		if ( alter ) {

			console.log( prop.id + ': UPDATE ALTER: ' + amt );
			alter.update( amt );

		} else {

			this.newAlter( prop, amt );

			if ( prop instanceof Property ) this.addAdj( prop.adj || prop.name, prop );

		}

	},

	/**
	 *
	 * @param {Property} prop
	 * @param {number} count
	 * @returns {InstMod} - InstMod wrapper for the alter modifier.
	 */
	newAlter( prop, count=1 ){

		let alter = new Alter( prop, count );
		this.alters[ prop.id ] = alter;

		alter.init(this);

	},

	/**
	 * Apply an adjective to the item's name.
	 * @param {string} adj
	 * @param {object} src - adjective source.
	 * @param {?string} [fallback=null] - fallback prefix to apply.
	 */
	addAdj( adj, src, fallback=null ) {

		if ( adj ) {

			if ( adj.includes( '%' ) ) {

				this.name = adj.replace( '%s', src.name ).replace( '%i', this.name );
				return;

			} else if ( !this.name.includes(adj) ) {

				this.name = adj + ' ' + this.name;
				return;

			}

		}

		if ( fallback ) this.addAdj( fallback, src );

	},

	is( k ) {
		return this.type === k || this.kind === k || this.hasTag(k) || this.name === k;
	}


}