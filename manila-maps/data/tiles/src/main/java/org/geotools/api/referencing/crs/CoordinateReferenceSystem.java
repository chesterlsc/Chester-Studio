// Minimal stand-in for a GeoTools type referenced by Planetiler's GeoUtils. GeoTools is only
// published on repo.osgeo.org (unreachable from the build machine) and is only needed for
// shapefile / GeoPackage reprojection, which this profile does not use.
package org.geotools.api.referencing.crs;

public interface CoordinateReferenceSystem {}
