# xcscore

Cross country league flight scoring for paragliding.

## Introduction

xcscore computes the highest scoring flight from an array of coords according to
the World XContest and Swiss Cross Country Cup rules. It is designed for use in
XC flight planning software like [XC Planner](https://xcplanner.appspot.com). It
uses crude brute force algorithms that support only a small number of
coordinates and is not suitable for scoring flights from GPS tracklogs.

## API overview

xcscore exports two functions:

* `scoreWorldXContest` for scoring flights according to the World XContest
  rules.
* `scoreCHCrossCountryCup` for scoring flights according to the Swiss Cross
  Country Cup rules.

Each function takes a single object as an argument with two properties:

* `coords`: an array of coordinates.
* `distKMFunc`: a function that returns the distance in kilometers between two
  coordinates.

Each function returns a single object describing the highest scoring flight
found with five properties:

* `flightType`: the type of the flight, e.g. `"openDist"`, `"flatTri"`, or
  `"faiTri"`. For a full list of flight types see the documentation.
* `dist`: the scoring distance of the flight.
* `multiplier`: the scoring multiplier for the type of flight.
* `score`: the score of the flight. Note that this is not necessarily equal to
  the product of `dist` and `multiplier` due to rounding rules.
* `coords`: the coordinates of the start, up to three turnpoints, and end of the
  scoring part of the flight.

If no scoring flight can be found (e.g. because there are fewer than two input
coords) then the returned object will have `flightType` `"none"`, `dist`,
`multiplier`, and `score` `0`, and `coords` `[]`.

For a full description of the API, consult the documentation in the `dist/docs`
directory.

## Performance

xcscore uses simple brute force algorithms for implementation simplicity and
minimal code size. CPU usage increases with O(N^5) and memory usage with O(N^2) so
xscore is heavily CPU bound.

The package includes benchmarks to measure performance, the results of which
depend heavily on the CPU. As a rough guide, 25 coords is fine on any machine
(scored in approximately less than 2ms on a single core of a 2014-era MacBook
Pro), whereas 50 coords is a reasonable upper limit (taking 60ms on the same
machine).

More sophisticated algorithms are used for scoring real GPS tracklogs with tens
of thousands of points. Contact the author for details.

## Use with popular JavaScript mapping libraries

xcscore is independent of the coordinate format and the function to compute the
distance between two coordinates. As such, it can be used with any mapping
library.

### Google Maps JavaScript API

`coords` can be an array of `google.maps.LatLng`s and you can use the following
function as `distKMFunc`:

```javascript
function distKM(latLng1, latLng2) {
    return google.maps.geometry.spherical.computeDistanceBetween(latLng1, latLng2, 6371);
}
```

### LeafletJS

`coords` can be an array of `LatLng`s and you can use the following function as
`distKMFunc`:

```javascript
function distKM(latLng1, latLng2) {
    return latLng1.distanceTo(latLng2)/1000;
}
```

## License

MIT