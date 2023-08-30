/**
 * Recursively freeze an object template.
 * Clones must be made to make any changes.
 * @param {*} obj
 */
const freezeData = ( obj ) => {

	let sub;
	for( let p in obj ){

		sub = obj[p];
		if ( typeof sub === 'object') freezeData(sub);
		else Object.freeze( sub );

	}

	return Object.freeze( obj );

}

/**
 * Class to load and store json plugin in a well-defined format.
 */
export default class Module {

	/**
	 * @property {object.<string,GData>} items - index of instanced items.
	 */
	/*get items() { return this._items; }
	set items(v){this._items=v;}*/

	/**
	 * @property {.<string,object>} raws - raw untyped object templates.
	 * used for reloading and comparing for data saves.
	 */
	get raws() { return this._raws; }
	set raws(v) { this._raws =v; }

	/**
	 * Lists of items by type of data.
	 * @property {.<string,object[]>}
	*/
	get rawLists(){return this._rawLists; }
	set rawLists(v){this._rawLists=v;}

	/**
	 * @property {.<string,GData>} gdatas - instanced game datas.
	 */
	get gdatas(){return this._gdatas; }
	set gdatas(v){this._gdatas = v}

	/**
	 * @property {.<string,GData[]>} lists - instanced lists
	 * corresponding to the raw lists before.
	 */
	get lists(){return this._lists;}
	set lists(v){this._lists =v;}

	/**
	 * @property {string} name
	 */
	get id() {return this._id;}
	set id(v) { this._id=v;}

	/**
	 * @property {string} name
	 */
	get name() {return this._name;}
	set name(v) { this._name=v;}

	/**
	 * @property {string} sym
	 */
	get sym(){return this._sym; }
	set sym(v) {this._sym =v;}

	get author() {return this._author;}
	set author(v) { this._author=v;}

	get email() {return this._email;}
	set email(v) { this._email=v;}

	set git(v) { this._git=v;}
	get git() {return this._git;}

	/**
	 * @property {boolean} isolate - don't merge items into parent
	 * module's item lists.
	 */
	set isolate(v){this._isolate =v;}
	get isolate(){ return this._isolate;}

	/**
	 * @property {Map<string,Module>} modules - submodules.
	 */
	get submodules(){ return this._submodules; }

	/**
	 *
	 * @param {?object} [mod=null] - module object.
	 * @param {string} mod.name
	 * @param {?string} mod.sym
	 * @param {?object<string,object[]>} mod.data - maps object to named data lists.
	 * @param {?string} mod.author
	 * @param {?string} mod.email
	 * @param {?string} mod.git
	 */
	constructor( mod=null, id='') {

		this.raws = {};
		this._submodules = null;

		if ( mod ) {

			this.sym = mod.sym;
			this.id = mod.module || id;
			this.name = mod.name || this.id;

			if ( mod.isolate ) this.isolate = mod.isolate;

			this.setLists( mod.data );
		}


	}

	/**
	 * Get an instanced data list.
	 * @param {*} name
	 */
	getList( name ) {
	}

	/**
	 *
	 * @param {string} id - name of submodule.
	 * @returns {?Module}
	 */
	getSub( id ) {
		return this._submodules.get(id);
	}

	/**
	 * Add and merge submodule.
	 * @param {Module} module
	 */
	addSub( module ){

		if (!this._submodules) this._submodules = new Map();

		this._submodules.set( module.id, module );

		//console.log('ADDING SUBMODUILE: ' + module.name );

		this.merge( module );

	}

	/**
	 * Set the instanced game data of current game.
	 * @param {.<string,GData>} datas - instanced Game data.
	 */
	setInstances( datas ) {

		let mDatas = this.gdatas = {};

		for( let p in datas ) {

			if ( datas[p].module == this.id ) {
				mDatas[p] = datas[p];
			}

		}

		if ( this._submodules ) {

			for( let m of this._submodules ) {
			}

		}

	}

	/**
	 * Set data used by parent modules.
	 * @param {GData} gdatas
	 */
	setParentData( gdatas ) {
	}

	/**
	 * Set the named data-lists provided by module.
	 * @param {.<string,object[]>} lists - data-lists used by module.
	 */
	setLists( lists ) {

		if ( lists == null ) return;

		for( let p in lists ) {

			var list = lists[p];
			if ( !list ) {

				console.warn( this.id + ': no list: ' + p );
				delete lists[p];

			} else {
				lists[p] = this.parseList( lists[p] );
			}

		}

		this.rawLists = lists;

	}

	/**
	 * Perform initial parsing and freeze of raw data objects.
	 * @param {object[]} arr
	 */
	parseList( arr ){

		let sym = this.sym;
		let modName = this.id;

		for( let i = arr.length-1; i >= 0; i-- ) {

			var it = arr[i];
			if ( !it.id ){
				console.warn('missing id: ' + it.name );
				continue;
			}
			if ( modName ) it.module = it.module || modName;
			if ( sym ) it.sym = it.sym || sym;

			this.raws[ it.id ] = freezeData( it );

		}

		return arr;

	}

	/**
	 * Merge module into this module.
	 * @param {GModule} mod - module to merge.
	 * @param {*} insertLists
	 */
	merge( mod ) {

		let items = mod.raws;
		let dest = this.raws;

		for( let p in items ) {
			/** @note merge overwrites */
			dest[p] = items[p];
		}

		if ( mod.isolate ) {
			console.log( mod.id + ': SKIPPING LIST MERGE');
			return;
		}

		for( let p in mod.rawLists ) {

			let list = mod.rawLists[p];
			dest = this.rawLists[p];

			if ( !Array.isArray(dest)) {

				this.rawLists[p] = list.slice(0);
				continue;

			}

			for( let i = list.length-1; i >= 0; i-- ) {
				dest.push( list[i] );
			}


		}


	}

}