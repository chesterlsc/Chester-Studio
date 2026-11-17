// Minimal stand-in for a GeoTools type referenced by Planetiler's GeoUtils. GeoTools is only
// published on repo.osgeo.org (unreachable from the build machine) and is only needed for
// shapefile / GeoPackage reprojection, which this profile does not use.
package org.geotools.referencing;

import org.geotools.api.referencing.FactoryException;
import org.geotools.api.referencing.crs.CoordinateReferenceSystem;
import org.geotools.api.referencing.operation.MathTransform;

public final class CRS {
  public enum AxisOrder { EAST_NORTH, NORTH_EAST, INAPPLICABLE }

  private CRS() {}

  public static CoordinateReferenceSystem decode(String code, boolean longitudeFirst) throws FactoryException {
    throw new FactoryException("CRS support not bundled: " + code);
  }

  public static CoordinateReferenceSystem parseWKT(String wkt) throws FactoryException {
    throw new FactoryException("CRS support not bundled");
  }

  public static MathTransform findMathTransform(CoordinateReferenceSystem a, CoordinateReferenceSystem b,
    boolean lenient) throws FactoryException {
    throw new FactoryException("CRS support not bundled");
  }

  public static AxisOrder getAxisOrder(CoordinateReferenceSystem crs) {
    return AxisOrder.EAST_NORTH;
  }
}
