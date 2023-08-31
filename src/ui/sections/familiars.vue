<script>
import CharPane from '../panes/charpane.vue';
import Upgrades from '../panes/upgrades.vue';
import Game from '../../game';
import {TRY_USE_ON} from '../../events';
import itemsBase from '../itemsBase';

export default {

	props:["module"],
	mixins:[itemsBase],
	components:{
		char:CharPane,
		upgrades:Upgrades
	},
	computed:{

		familiar(){

			let fam = Game.getSlot('familiar');
			if ( fam ) {

				console.log('num familiars: ' + fam );
				console.log( 'fam tohit: ' + fam.tohit );
				console.log( 'fam type: ' + fam.constructor.name );

			}
			return Game.getSlot('familiar');
		}
	},
	created(){
		this.TRY_USE_ON = TRY_USE_ON;
	}

}
</script>


<template>
	<div v-if="module&&familiar" class="familiars">
	<char :char="familiar" />

	<upgrades :items="module.lists.tasks" :event="TRY_USE_ON" :target="familiar" />
	<upgrades :items="module.lists.alters" :event="TRY_USE_ON" :target="familiar" />
	</div>
	<div v-else-if="!module">FAMILIAR MODULE MISSING</div>
	<div v-else>FAMILIAR NOT FOUND</div>
</template>