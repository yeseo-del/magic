<script>
import { floor, lowFixed, precise } from 'util/format';

/**
 * Detailed Stat display for a single Character.
 */
export default {

	props:["char"],
	computed:{

		level() {return this.char.level.value },

		defense() {return this.char.defense },
		dodge(){ return Math.floor(this.char.dodge.valueOf()) },
		/*luck(){return Math.floor(this.char.luck.valueOf()) },*/
		damage() { return this.char.damage.valueOf() },
		tohit() { return this.char.tohit ? this.char.tohit.value : 0; },
		exp() {return floor( this.char.exp.value ); },
		next() {return floor( this.char.next ); },

	}

}
</script>

<template>
<div class="charpane">

		<div>
		<table>
				<!--<div class="name-span"><span">{{familiar.name }}</span></div>-->
		<tr><td @mouseenter.capture.stop="itemOver( $event, char )">name</td><th class="text-entry"><input class="fld-name" type="text" v-model="char.name"></th></tr>
		<tr><td>level</td><th class="num-align"> {{ level }}</th></tr>
		<tr><td>exp</td><th class="num-align"> {{ exp }} / {{ next }} </th></tr>
		<tr><td>max hp</td><th class="num-align"> {{char.hp.max}} </th></tr>
		<tr><td>defense</td><th class="num-align"> {{defense}} </th></tr>
		<tr><td>dodge</td><th class="num-align"> {{dodge }} </th></tr>
		<tr><td>damage bonus</td><th class="num-align"> {{damage}} </th></tr>
		<tr><td>hit bonus</td><th class="num-align"> {{tohit}} </th></tr>
		<tr><td>speed</td><th class="num-align"> {{char.speed }} </th></tr>
		</table>
		</div>

</div>
</template>