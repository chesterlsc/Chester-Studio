// Minimal stand-in for a GeoTools type referenced by Planetiler's GeoUtils. GeoTools is only
// published on repo.osgeo.org (unreachable from the build machine) and is only needed for
// shapefile / GeoPackage reprojection, which this profile does not use.
package org.geotools.referencing.operation.transform;

import org.geotools.api.referencing.operation.MathTransform;

public class AffineTransform2D implements MathTransform {
  public AffineTransform2D(double m00, double m10, double m01, double m11, double m02, double m12) {}
}
