// ES6 
// Topics covered:
// Classes
// Object creation using constructors
// Inheritance using ES6 Classes
// Getters & Setters
// static methods in Classes
// String interpolation
// Arrow operator
// Array methods (reduce, forEach)


class Details {
  constructor(name, year) {
    this._name = name;
    this._year = year;
  }

  // getters
  get name() { return this._name; }
  get year() { return this._year; }

  // setters
  set name(newName) { this._name = newName; }
  set year(newYear) { this._year = newYear; }
}

class Park extends Details {
  constructor(name, year, area, trees) {
    super(name, year);
    this._trees = trees;
    this._area = area;
  }

  // getters
  get trees() { return this._trees; }
  get area() { return this._area; }

  density() {
    const treeDensity = this.trees / this.area;
    return `${this.name} has a tree density of ${treeDensity} trees per square km.`;
  }
}

class Street extends Details {

  constructor(name, year, length, size) {
    super(name, year);
    this._length = length;
    this._size = size;
  }

  // getters
  get length() { return this._length; }
  get size() { return this._size; }

  // static
  static unitLength() {
    return 'km';
  }

  sizeClassification() {
    return `${this._name}, build in ${this._year}, is a ${StreetUtil.sizeMapper(this.size)} street.`
  }
}

class StreetUtil {
  static sizeMapper(size) {
    switch (size) {
      case 1: return 'tiny';
      case 2: return 'small';
      case 3: return 'normal';
      case 4: return 'big';
      case 5: return 'huge';
      default: return 'normal';
    }
  }
}

class Administration {
  constructor(parks, streets) {
    this._parks = parks || [];
    this._streets = streets || [];
  }

  // getters
  get parks() { return this._parks; }
  get streets() { return this._streets; }

  // setters
  set parks(newParks) { this._parks = newParks; }
  set streets(newStreets) { this._streets = newStreets; }

  // Park features
  averageParkAge() {
    const currentYear = new Date().getFullYear();
    const totalYearsOfEst = this.parks.reduce((accumulator, park) => accumulator + (currentYear - park.year), 0);
    const averageYearOfEst = totalYearsOfEst / this.parks.length;
    console.log(`Our ${this.parks.length} parks have an average age of ${averageYearOfEst}`);
  }

  printTreeDensityOfEachPark() {
    this.parks.forEach(park => console.log(park.density()));
  }

  parkWithTreesMoreThan(minTrees) {
    this.parks.forEach(park => {
      if (park.trees > minTrees) {
        console.log(`${park.name} has more than ${minTrees} trees.`)
      }
    });
  }

  // Street Features
  totalAndAverageLengthOfTownsStreets() {
    const totalLength = this.streets.reduce((accumulator, street) => accumulator + street.length, 0);
    const averageLength = totalLength / this.streets.length;
    const unit = Street.unitLength();
    console.log(`Our ${this.streets.length} streets has a total length of ${totalLength} ${unit}, 
      with an average of ${averageLength} ${unit}.`);
  }

  sizeClassificationOfStreets() {
    this._streets.forEach(street => console.log(street.sizeClassification()));
  }
}

const allParks = [
  new Park('Green Park', 1987, 0.2, 215),
  new Park('National Park', 1894, 2.9, 3541),
  new Park('Oak Park', 1953, 0.4, 949)
];

const allStreets = [
  new Street('Ocean Avenue', 1999, 1.1, 4),
  new Street('Evergreen Street', 2008, 2.7, 2),
  new Street('4th Street', 2015, 0.8),
  new Street('Sunset Boulevard', 1982, 2.5, 5)
];

const townAdministrator = new Administration(allParks, allStreets);
// for Parks
console.log('\n************* Parks *************');
townAdministrator.averageParkAge();
townAdministrator.printTreeDensityOfEachPark();
townAdministrator.parkWithTreesMoreThan(1000);

// for Streets
console.log('\n************* Streets *************');
townAdministrator.totalAndAverageLengthOfTownsStreets();
townAdministrator.sizeClassificationOfStreets();
