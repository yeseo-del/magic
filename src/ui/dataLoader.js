import GData from './items/gdata';

import { PrepData } from './modules/parsing';

import Resource from './items/resource';
import RevStat from './items/revStat';
import StatData from './items/statData';
import Skill from './items/skill';
import Monster from './items/monster';

import { Locale } from './items/locale';

import Spell from './items/spell.js';
import Task from './items/task';

import { mergeSafe } from 'objecty';
import ProtoItem from './protos/protoItem';
import Property from './chars/property';
import Enchant from './items/enchant';
import Potion from './items/potion';
import Encounter from './items/encounter';
import GEvent from './items/gevent';

import Player from './chars/player';

import Loader from './util/jsonLoader';
import GClass from './items/gclass';
import Module from './modules/module';
import { SKILL, ENCOUNTER, MONSTER, ARMOR, WEAPON, HOME, POTION, RESOURCE, EVENT, DUNGEON } from './values/consts';
import State from './chars/state';
import GameState from './gameState';

const DataDir = './data/';

// list of all files to load.
const ModFiles = 'modules';

/**
 *
 * @param {string[]} fileList
 * @param {string} [dir=DataDir]
 * @returns {Promise.<string,object>}
 */
const loadFiles = ( fileList, dir=DataDir ) => {
	return new Loader(dir, fileList).load();
}

/**
 * @todo replace with server call.
 */
export default {

	/**
	 * @property {Module} main - main module.
	 */
	main:null,

	/**
	 * Load information on all available data files.
	 * @param {string} srcList - name of file specifying mod list.
	 * @returns {object}
	 */
	async loadModInfo( srcList ) {

		// load the local list of mod files then load all listed files.
		return loadFiles( [srcList] ).then( list=>{
			if (!list) throw new Error('Modlist not found: ' + srcList );
			return list[srcList];
		});

	},

	async loadGame( saveData ) {

		if ( this.main == null ) {

			let files = await this.loadModInfo( ModFiles );

			this.main = await this.loadModFiles( files.core, files.modules, DataDir + 'modules/' );

		}

		return new GameState( this.instance( this.main, saveData ), this.main );

	},

	async loadModFiles( files, submods, moddir ){

		let dataLists = await loadFiles( files );
		let m = new Module();

		m.setLists( dataLists );

		if ( submods ) {

			let subFiles = await loadFiles( submods, moddir );

			for( let p in subFiles ) {
				m.addSub( new Module( subFiles[p], p ) );
			}

		}

		return m;

	},

	/**
	 * Load single-module file.
	 * @param {string} file
	 */
	async loadModule( file, subDir='' ) {

		let modFiles = await loadFiles( [file], DataDir + subDir );
		return new Module( modFiles[file] );

	},

	/**
	 * At this point dataLists and gdatas both refer to the same data items.
	 * dataLists are simply separated into lists by type (upgrades,tasks, etc.)
	 * @param {Module} module
	 * @param {object} saveData
	 * @returns {object} initialized save&game data.
	 */
	instance( module, saveData ){

		if (!saveData ) saveData = {};
		let raws = module.raws;
		let rawLists = module.rawLists;

		// restore Percent/Range classes /special functions of NON-GDATAs.
		for( let p in saveData ) {

			// items prepped separately so template can be overwritten, then prep, then template assigned.
			if ( p === 'items') continue;

			saveData[p] = PrepData( saveData[p], p );

		}

		let items = saveData.items || {};
		this.updateAliases( items, raws );

		// Merge and ensure data items exist for all raw datas.
		module.gdatas = saveData.items = this.mergeItems( items, raws );

		if ( module.submodules ) {

			// form lists for submodules.
			for( let subMod of module.submodules.values() ) {

				if ( subMod.isolate ) {

					subMod.lists = {};
					this.instantiate( subMod.lists, subMod.rawLists, module.gdatas )

				}
			//	this.instantiate( subMod.lists, subMod.rawLists );

			}
		}

		// creates instanced lists inside saveData and returns saveData (now instanced).
		return this.instantiate( saveData, rawLists, module.gdatas );
	},

	/**
	 * @private
	 * @param {object} inst - saved data.
	 * @param {*} rawLists
	 */
	instantiate( inst, rawLists, items ){

		if ( rawLists.resources) inst.resources = this.initList( items, rawLists['resources'], Resource );

		if ( rawLists.stressors ) {
			inst.stressors = this.initList( items, rawLists.stressors, Resource, 'stress', 'stress' );
			inst.stressors.forEach(v=>v.hide=true);
		}

		if ( rawLists.upgrades ) inst.upgrades = this.initList( items, rawLists['upgrades'], GData, null, 'upgrade' );

		if ( rawLists.homes ) {
			inst.homes = this.initList( items, rawLists['homes'], GData, HOME, HOME );
			inst.homes.forEach( v=>v.slot=HOME);
		}

		if ( rawLists.furniture ) this.initList( items, rawLists.furniture, GData, 'furniture', 'furniture' );

		if ( rawLists.skills ) inst.skills = this.initList( items, rawLists.skills, Skill, SKILL );

		if ( rawLists.encounters ) inst.encounters = this.initList( items, rawLists['encounters'], Encounter, ENCOUNTER, ENCOUNTER);
		if ( rawLists.monsters ) inst.monsters = this.initList( items, rawLists['monsters'], Monster, MONSTER, MONSTER );

		if ( rawLists.rares ) inst.rares = this.initList( items, rawLists['rares'], ProtoItem );
		if ( rawLists.states ) inst.states = this.initList( items, rawLists['states'], State, 'state', 'state' );
		if ( rawLists.reagents ) inst.reagents = this.initList( items, rawLists['reagents'], Resource );

		if ( rawLists.locales ) {
			inst.locales = this.initList( items, rawLists.locales, Locale );
			inst.locales.forEach( v=>v.sym = v.sym||'🌳');
		}

		if ( rawLists.dungeons ) {
			inst.dungeons = this.initList( items, rawLists.dungeons, Locale, null, DUNGEON );
			inst.dungeons.forEach( v=>v.sym = v.sym || '⚔' );
		}
		if ( rawLists.spells ) inst.spells = this.initList( items, rawLists.spells, Spell );

		if ( rawLists.stats ) inst.stats = this.initList( items, rawLists['stats'], StatData, 'stat', 'stat' );

		/**@deprecated ??? @compat */
		//this.initItems( items, lists['items'], Item, ITEM, ITEM);

		if ( rawLists.armors ) {
			inst.armors = this.initList( items, rawLists.armors, ProtoItem, ARMOR,ARMOR );
			inst.armors.forEach( v=>v.kind = v.kind || ARMOR );
		}

		if ( rawLists.weapons ) {
			inst.weapons = this.initList( items, rawLists.weapons, ProtoItem, WEAPON, WEAPON );
			inst.weapons.forEach(v=>v.kind=v.kind ||WEAPON);
		}

		if ( rawLists.potions ) inst.potions = this.initList( items, rawLists.potions, Potion, POTION, POTION );

		if ( rawLists.materials ) inst.materials = this.initList( items, rawLists.materials, Property, 'material', 'material' );
		if ( rawLists.properties ) inst.properties = this.initList( items, rawLists.properties, Property, 'property', 'property' );
		if ( rawLists.alters ) inst.alters = this.initList( items, rawLists.alters, Property, 'alter', 'alter' );

		if ( rawLists.events ) inst.events = this.initList( items, rawLists.events, GEvent, EVENT, EVENT );
		if ( rawLists.classes ) inst.classes = this.initList( items, rawLists.classes, GClass, 'class', 'class' );

		if ( rawLists.tasks ) inst.tasks = this.initList( items, rawLists.tasks, Task, null, 'task' );

		if ( rawLists.enchants ) inst.enchants =this.initList( items, rawLists.enchants, Enchant, null, 'enchant' );
		if ( rawLists.sections ) inst.sections = this.initList( items, rawLists.sections );

		if ( rawLists.player ) inst.player = this.initPlayer( items, rawLists.player );

		return inst;

	},

	initList( items, dataList, UseClass=GData, tag=null, type=null ) {

		if ( dataList === null || dataList === undefined ) return undefined;

		let gameList = [];
		let len = dataList.length;
		for( let i = 0; i < len; i++ ) {

			let temp = dataList[i];
			if ( !temp ) {
				console.warn("missing template!!!");
				continue;
			}
			let def = items[ temp.id ];

			if ( def.reverse) def = new RevStat(def);
			else if ( def.stat ) def = new StatData(def);
			else def = new UseClass( def );

			items[def.id] = def;
			gameList.push(def);

			if ( tag ) def.addTag( tag );
			if ( type ) def.type = type;


		}

		return gameList;

	},

	/**
	 * @param {.<string,object>} items - partially instanced stats.
	 * @param {.<string,object>} rawStats - player stats from json.
	 */
	initPlayer( items, rawStats ) {

		let vars = items.player || {};

		for( let t of rawStats ) {

			var def = items[t.id];

			vars[t.id] = items[t.id] = def =
			def.stat === true ? new StatData(def) : ( def.reverse === true ? new RevStat(def) : new Resource( def ) );

			def.type = RESOURCE;

		}

		return items.player = new Player(vars);

	},

	/**
	 * Merge template data into saved data items.
	 * @param {Object} saveItems - previous save items.
	 * @param {.<string,Object>} raws - template items..
	 * @returns {.<string,Object>} - the saveItems with data merged from default data.
	 */
	mergeItems( saveItems, raws ) {

		/**
		 * @note ordering.
		 * 1) raw template merged over raw save.
		 * 2) data prepared with type instances.
		 * 3) template assigned LAST because the template is frozen and can't be prepped.
		 */
		for( let p in raws ) {

			var saveObj = saveItems[p] || {};

			if ( typeof saveObj === 'number') {
				saveObj = { val:saveObj };
			}
			mergeSafe( saveObj, raws[p] );

			saveItems[p] = PrepData( saveObj, p );

			saveObj.template = raws[p];

		}

		return saveItems;

	},

	updateAliases( saveItems, raws ){

		for( let id in raws ) {

			let t = raws[id];
			if ( t.alias && !saveItems[id] ) {
				// item not in save data. check aliased item.
				var it = saveItems[t.alias];
				if ( it ) {
					console.warn('alias: ' + t.alias + ' -> ' + id );
					saveItems[id] = it;
					delete saveItems[t.alias];
				}
			}

		}

	}

}