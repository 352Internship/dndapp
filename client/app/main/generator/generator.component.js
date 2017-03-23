import angular from 'angular';
import uiRouter from 'angular-ui-router';
import routing from './generator.routes';

export class GeneratorController {

  /*@ngInject*/
  constructor($http, $state, Character, $window) {
    this.$http = $http;
    this.$state = $state;
    this.createChar = Character.createChar;
    this.first = Character.firstOption;
    this.localStorage = $window.localStorage;
  }

  $onInit() {
    var vm = this;

    this.raceMain = true;
    this.classMain = true;
    this.showBackgroundVariant = false;

    this.$http.get("assets/races.json")
              .then(res => {
                vm.raceList = res.data;
                vm.currentRace = res.data[0];
              })
              .catch(err => {
                return err;
              });

    this.$http.get("assets/classes.json")
              .then(res => {
                vm.classList = res.data;
                vm.currentClass = res.data[0];
              })
              .catch(err => {
                return err;
              });

    this.$http.get('assets/alignment.json')
              .then(res => {
                vm.alignList = res.data;
                vm.currentAlign = res.data[0];
              })
              .catch(err => {
                return err;
              });

    this.$http.get('assets/backgrounds.json')
              .then(res => {
                vm.backgroundList = res.data;
                vm.currentBackground = res.data[0];
              })
              .catch(err => {
                return err;
              });
  }

  continueChar(generate) {
    if(generate == 'race' && 'class'){
      this.$state.go('generator');
    }
  }

  selectRace(race) {
    this.currentRace = race;
  }

  selectClass(build) {
    this.currentClass = build;
  }

  selectAlign(align) {
    this.currentAlign = align;
  }

  selectBackground(background) {
    this.currentBackground = background;
  }

  backgroundVariant(){
    if(this.showBackgroundVariant){
      this.showBackgroundVariant = false;
    } else {
      this.showBackgroundVariant = true;
    }
  }

  selectMainRace(){
    this.selectedRace = this.currentRace;
    if(this.selectedRace.name == 'Half-Elf' || this.selectedRace.name == 'Half-Orc' || this.selectedRace.name == 'Tiefling'){
      this.saveRace();
    }
    else {
      this.raceMain = false;
      this.currentSubrace = this.selectedRace.subraces[0];
    }
  }

selectMainClass(){
  this.selectedClass = this.currentClass;
  this.classMain = false;
  this.currentArchetype = this.selectedClass.archetype.types[0];
}

selectSubrace(subrace){
  this.currentSubrace = subrace;
}

selectArchetype(archetype){
  this.currentArchetype = archetype;
}

  goBackToRace(){
    this.raceMain = true;
  }

  goBackToClass(){
    this.classMain = true;
  }

  saveRace(){
    // console.log(this.currentRace);
    var newCharacter;
    var race = this.currentRace;
    var raceInfo;
    if(race.name == 'Half-Elf' || race.name == 'Half-Orc' || race.name == 'Tiefling'){
      raceInfo = {
        bio: {
          languages: race.traits.lang,
          appearance: {
            size: race.traits.size
          }
        },
        general: {
          movement: race.traits.baseSpd
        },
        race: {
          main: race.name
        }
      };
    }
    else {
      // console.log(this.currentSubrace);
      var subrace = this.currentSubrace;
      raceInfo = {
        bio: {
          languages: race.traits.lang,
          appearance: {
            size: race.traits.size
          }
        },
        general: {
          movement: race.traits.baseSpd
        },
        race: {
          main: race.name,
          subrace: subrace.name
        }
      };
    }
    if(this.first() == 'race'){
      newCharacter = raceInfo;
      this.localStorage.setItem('character-in-progress', JSON.stringify(newCharacter));
      this.$state.go('generatorClass');
    } else {
      newCharacter = JSON.parse(this.localStorage['character-in-progress']);
      newCharacter.bio = raceInfo.bio;
      newCharacter.general = raceInfo.general;
      newCharacter.race = raceInfo.race;
      this.localStorage.setItem('character-in-progress', JSON.stringify(newCharacter));
      this.$state.go('generatorTwo');
    }
    // console.log(this.localStorage['character-in-progress']);
  }

  saveClass(){
    // console.log(this.currentClass);
    var newCharacter;
    var currentClass = this.currentClass;
    var archetype = this.currentArchetype;
    var classInfo = {
      class: {
        main: currentClass.name,
        archetype: archetype.name
      },
      combat: {
        hitDie: currentClass.combat.hitDie,
      }
    };
    if(this.first() == 'class'){
      newCharacter = classInfo;
      this.localStorage.setItem('character-in-progress', JSON.stringify(newCharacter));
      this.$state.go('generatorRace');
    } else {
      newCharacter = JSON.parse(this.localStorage['character-in-progress']);
      newCharacter.class = classInfo.class;
      newCharacter.combat = classInfo.combat;
      this.localStorage.setItem('character-in-progress', JSON.stringify(newCharacter));
      this.$state.go('generatorTwo');
    }
    // console.log(this.localStorage['character-in-progress']);
  }

saveAlign(){
  var newCharacter;
  var currentAlign = this.currentAlign;
  var alignInfo = currentAlign.name;
  if(this.first() =='align'){
    newCharacter = JSON.parse(this.localStorage['character-in-progress']);
    newCharacter.general.alignment = alignInfo
    this.localStorage.setItem('character-in-progress', JSON.stringify(newCharacter));
    this.$state.go('generatorBackground');
  } else {
    newCharacter = JSON.parse(this.localStorage['character-in-progress']);
    newCharacter.general.alignment = alignInfo
    this.localStorage.setItem('character-in-progress', JSON.stringify(newCharacter));
    this.$state.go('generatorThree');
  }
}

saveBackground(){
  var newCharacter;
  var currentBackground = this.currentBackground;
  var backgroundInfo = {
      background:{
        main: currentBackground.name
      }
  };
  if(this.first() =='background'){
    newcharacter = alignInfo;
    this.localStorage.setItem('character-in-progress', JSON.stringify(newCharacter));
    this.$state.go('generatorAlignment');
  } else {
    newCharacter = JSON.parse(this.localStorage['character-in-progress']);
    newCharacter.background = backgroundInfo.background;
    this.localStorage.setItem('character-in-progress', JSON.stringify(newCharacter));
    this.$state.go('generatorThree');
  }
}

}

export default angular.module('dndappApp.generator', [uiRouter])
  .config(routing)
  .component('generator', {
    template: require('./generator.html'),
    controller: GeneratorController,
    controllerAs: 'genCtrl'
  })
  .component('pickclass', {
    template: require('./pickclass.html'),
    controller: GeneratorController,
    controllerAs: 'genCtrl'
  })
  .component('pickrace', {
    template: require('./pickrace.html'),
    controller: GeneratorController,
    controllerAs: 'genCtrl'
  })
  .component('generatortwo', {
    template: require('./generatortwo.html'),
    controller: GeneratorController,
    controllerAs: 'genCtrl'
  })
  .component('pickbackground', {
    template: require('./pickbackground.html'),
    controller: GeneratorController,
    controllerAs: 'genCtrl'
  })
  .component('pickalignment', {
    template: require('./pickalignment.html'),
    controller: GeneratorController,
    controllerAs: 'genCtrl'
  })
  .component('generatorthree', {
    template: require('./generatorthree.html'),
    controller: GeneratorController,
    controllerAs: 'genCtrl'
  })
  .component('pickspells', {
    template: require('./pickspells.html'),
    controller: GeneratorController,
    controllerAs: 'genCtrl'
  })
  .component('pickweapons', {
    template: require('./pickweapons.html'),
    controller: GeneratorController,
    controllerAs: 'genCtrl'
  })
  .component('pickequip', {
    template: require('./pickequip.html'),
    controller: GeneratorController,
    controllerAs: 'genCtrl'
  })
  .component('pickstats', {
    template: require('./pickstats.html'),
    controller: GeneratorController,
    controllerAs: 'genCtrl'
  })
  .name;
