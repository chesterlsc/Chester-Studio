package manila;

import com.onthegomap.planetiler.FeatureCollector;
import com.onthegomap.planetiler.FeatureMerge;
import com.onthegomap.planetiler.Planetiler;
import com.onthegomap.planetiler.Profile;
import com.onthegomap.planetiler.VectorTile;
import com.onthegomap.planetiler.config.Arguments;
import com.onthegomap.planetiler.geo.GeometryException;
import com.onthegomap.planetiler.reader.SourceFeature;
import com.onthegomap.planetiler.reader.osm.OsmElement;
import com.onthegomap.planetiler.reader.osm.OsmRelationInfo;
import com.onthegomap.planetiler.reader.osm.OsmSourceFeature;
import com.onthegomap.planetiler.util.ZoomFunction;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Vector tile profile for the Manila offline map. Implements the tile schema in
 * CONTRACT.md (layers water, waterway, landuse, building, road, rail, aeroway,
 * boundary, place, poi).
 */
public class ManilaProfile implements Profile {


  record AdminRel(long id, int level) implements OsmRelationInfo {}

  /** Admin boundary ways running through the bay / lake (from water.py), not drawn. */
  private final Set<Long> waterBoundaryWays;

  public ManilaProfile(Set<Long> waterBoundaryWays) {
    this.waterBoundaryWays = waterBoundaryWays;
  }

  /** Barangay relations that have their own label node (that node is labelled instead). */
  private final Set<Long> relationsWithLabelNode = java.util.concurrent.ConcurrentHashMap.newKeySet();

  @Override
  public String name() {
    return "manila";
  }

  @Override
  public String description() {
    return "Metro Manila offline basemap";
  }

  @Override
  public String attribution() {
    return "<a href=\"https://www.openstreetmap.org/copyright\">© OpenStreetMap contributors</a>";
  }

  @Override
  public List<OsmRelationInfo> preprocessOsmRelation(OsmElement.Relation rel) {
    if (rel.hasTag("boundary", "administrative")) {
      String lvl = rel.getString("admin_level");
      if ("10".equals(lvl)) {
        for (var m : rel.members()) {
          if (m.type() == OsmElement.Type.NODE && "label".equals(m.role())) relationsWithLabelNode.add(rel.id());
        }
      }
      if ("6".equals(lvl) || "10".equals(lvl)) {
        return List.of(new AdminRel(rel.id(), Integer.parseInt(lvl)));
      }
    }
    return null;
  }

  // ---------------------------------------------------------------- helpers

  static String name(SourceFeature sf) {
    String n = sf.getString("name");
    if (n == null || n.isBlank()) n = sf.getString("name:en");
    return n == null || n.isBlank() ? null : n.trim();
  }

  private static final Pattern NUM = Pattern.compile("^\\s*(-?[0-9]+(?:[.,][0-9]+)?)\\s*(m|meters?|metres?|ft|feet|')?\\s*$",
    Pattern.CASE_INSENSITIVE);

  static Double parseLength(Object v) {
    if (v == null) return null;
    Matcher m = NUM.matcher(v.toString());
    if (!m.matches()) return null;
    double d = Double.parseDouble(m.group(1).replace(',', '.'));
    String u = m.group(2);
    if (u != null && (u.startsWith("f") || u.equals("'"))) d *= 0.3048;
    return d;
  }

  static Double parseNum(Object v) {
    if (v == null) return null;
    try {
      return Double.parseDouble(v.toString().trim().replace(',', '.'));
    } catch (NumberFormatException e) {
      return null;
    }
  }

  static boolean isRelation(SourceFeature sf) {
    return sf instanceof OsmSourceFeature osf && osf.originalElement() instanceof OsmElement.Relation;
  }

  static boolean yes(SourceFeature sf, String key) {
    Object v = sf.getTag(key);
    return v != null && Set.of("yes", "true", "1").contains(v.toString());
  }

  // ---------------------------------------------------------------- dispatch

  @Override
  public void processFeature(SourceFeature sf, FeatureCollector fc) {
    try {
      if ("water".equals(sf.getSource())) {
        processWaterFile(sf, fc);
        return;
      }
      if (sf.canBePolygon()) {
        processWaterPolygon(sf, fc);
        processLanduse(sf, fc);
        processBuilding(sf, fc);
        processAerowayPolygon(sf, fc);
        processBarangayLabel(sf, fc);
      }
      if (sf.canBeLine() && !isRelation(sf)) {
        processRoad(sf, fc);
        processRail(sf, fc);
        processWaterway(sf, fc);
        processAerowayLine(sf, fc);
        processBoundary(sf, fc);
      }
      if (sf.isPoint()) {
        processPlace(sf, fc);
      }
      processPoi(sf, fc);
      processHousenumber(sf, fc);
    } catch (GeometryException e) {
      // skip broken geometries
    }
  }

  // ---------------------------------------------------------------- water

  void processWaterFile(SourceFeature sf, FeatureCollector fc) {
    String cls = sf.getString("class", "sea");
    var f = fc.polygon("water").setAttr("class", cls).setMinZoom(0).setBufferPixels(4)
      .setMinPixelSize(1);
    String n = sf.getString("name");
    if (n != null && !"sea".equals(cls)) f.setAttr("name", n);
  }

  void processWaterPolygon(SourceFeature sf, FeatureCollector fc) throws GeometryException {
    String cls = null;
    if (sf.hasTag("natural", "water") || sf.hasTag("waterway", "riverbank") ||
      sf.hasTag("landuse", "reservoir", "basin") || sf.hasTag("natural", "bay") && false) {
      String w = sf.getString("water", "");
      if (sf.hasTag("waterway", "riverbank")) w = "river";
      if (sf.hasTag("landuse", "reservoir")) w = "reservoir";
      cls = switch (w) {
        case "river", "stream", "oxbow", "rapids" -> "river";
        case "lake", "lagoon" -> "lake";
        case "pond", "fishpond", "fish_pond", "basin" -> "pond";
        case "reservoir", "reflecting_pool" -> "reservoir";
        case "canal", "ditch", "drain" -> "canal";
        case "" -> "";
        default -> "other";
      };
      if (sf.hasTag("landuse", "basin")) cls = "pond";
      if (cls.isEmpty()) cls = sf.areaMeters() > 50_000 ? "lake" : "pond";
    } else if (sf.hasTag("leisure", "swimming_pool") ) {
      return;
    }
    if (cls == null) return;
    if (sf.hasTag("intermittent", "yes") && "other".equals(cls)) return;
    double km2 = sf.areaMeters() / 1e6;
    int minz = km2 > 1.5 ? 0 : 10;
    var f = fc.polygon("water").setAttr("class", cls).setMinZoom(minz).setMinPixelSize(2)
      .setMinPixelSizeAtMaxZoom(0.5).setBufferPixels(4);
    String n = name(sf);
    if (n != null && km2 > 0.05) f.setAttr("name", n);
  }

  void processWaterway(SourceFeature sf, FeatureCollector fc) {
    String ww = sf.getString("waterway");
    if (ww == null) return;
    String cls = switch (ww) {
      case "river" -> "river";
      case "canal" -> "canal";
      case "stream", "brook" -> "stream";
      case "drain", "ditch" -> "drain";
      default -> null;
    };
    if (cls == null) return;
    if (sf.hasTag("tunnel", "culvert") || sf.hasTag("tunnel", "yes")) return;
    var f = fc.line("waterway").setAttr("class", cls).setMinZoom("river".equals(cls) ? 9 : 12)
      .setMinPixelSize(0);
    String n = name(sf);
    if (n != null) f.setAttr("name", n);
  }

  // ---------------------------------------------------------------- landuse

  static String landuseClass(SourceFeature sf) {
    String lu = sf.getString("landuse", "");
    String le = sf.getString("leisure", "");
    String am = sf.getString("amenity", "");
    String na = sf.getString("natural", "");
    String ae = sf.getString("aeroway", "");
    switch (le) {
      case "park", "playground", "nature_reserve", "dog_park" -> { return "park"; }
      case "garden" -> { return "garden"; }
      case "pitch", "track" -> { return "pitch"; }
      case "golf_course", "miniature_golf" -> { return "golf"; }
      default -> {}
    }
    switch (am) {
      case "hospital" -> { return "hospital"; }
      case "school", "kindergarten" -> { return "school"; }
      case "university", "college" -> { return "university"; }
      case "grave_yard" -> { return "cemetery"; }
      case "parking" -> { return sf.hasTag("parking", "underground", "multi-storey", "rooftop") ? null : "parking"; }
      default -> {}
    }
    if ("aerodrome".equals(ae)) return "airport";
    switch (lu) {
      case "grass", "village_green", "meadow", "greenfield", "flowerbed" -> { return "grass"; }
      case "forest" -> { return "forest"; }
      case "cemetery" -> { return "cemetery"; }
      case "commercial" -> { return "commercial"; }
      case "retail" -> { return "retail"; }
      case "industrial", "port", "railway", "depot", "quarry", "landfill" -> { return "industrial"; }
      case "residential" -> { return "residential"; }
      case "military" -> { return "military"; }
      case "farmland", "orchard", "farmyard", "plant_nursery", "aquaculture", "vineyard" -> { return "farmland"; }
      case "recreation_ground" -> { return "park"; }
      case "education" -> { return "school"; }
      default -> {}
    }
    switch (na) {
      case "wood" -> { return "forest"; }
      case "grassland", "scrub", "heath" -> { return "grass"; }
      case "sand", "beach" -> { return "sand"; }
      case "wetland", "mud" -> { return "wetland"; }
      default -> {}
    }
    return null;
  }

  void processLanduse(SourceFeature sf, FeatureCollector fc) throws GeometryException {
    String cls = landuseClass(sf);
    if (cls == null) return;
    double m2 = sf.areaMeters();
    // "large" polygons from z10, everything from z13
    int minz = m2 > 400_000 ? 10 : m2 > 100_000 ? 11 : m2 > 20_000 ? 12 : 13;
    fc.polygon("landuse").setAttr("class", cls).setMinZoom(minz)
      .setMinPixelSizeBelowZoom(12, 3).setMinPixelSize(1).setBufferPixels(4)
      .setSortKey((int) Math.min(1_000_000, -Math.log(m2 + 1) * 1000 + 100_000));
  }

  // ---------------------------------------------------------------- building

  static final Set<String> SMALL_BUILDINGS = Set.of("house", "detached", "residential", "hut", "shed", "terrace",
    "semidetached_house", "bungalow", "garage", "garages", "roof", "kiosk", "cabin", "toilets", "carport",
    "shelter", "guardhouse", "yes", "static_caravan", "construction", "service", "shack");

  void processBuilding(SourceFeature sf, FeatureCollector fc) throws GeometryException {
    Object b = sf.getTag("building");
    if (b == null || "no".equals(b)) return;
    if (sf.hasTag("location", "underground")) return;
    String type = b.toString();
    double area = sf.areaMeters();
    double roof = 0;
    Double rl = parseNum(sf.getTag("roof:levels"));
    Double rh = parseLength(sf.getTag("roof:height"));
    if (rh != null) roof = rh;
    else if (rl != null) roof = rl * 2.5;
    Double h = parseLength(sf.getTag("height"));
    if (h == null) h = parseLength(sf.getTag("building:height"));
    if (h == null) {
      Double lv = parseNum(sf.getTag("building:levels"));
      if (lv != null && lv >= 0 && lv < 200) h = lv * 3.0 + roof + (lv > 0 ? 0.5 : 0);
    }
    if (h == null) {
      if ("roof".equals(type) || "carport".equals(type)) h = 4.0;
      else if (Set.of("apartments", "condominium", "dormitory", "hotel").contains(type)) h = area > 1500 ? 30.0 : 12.0;
      else if (Set.of("commercial", "office", "retail", "mall", "supermarket", "hospital", "school", "university",
        "college", "public", "government", "civic", "train_station", "transportation", "church", "cathedral")
        .contains(type) || sf.hasTag("amenity") || sf.hasTag("shop")) {
        h = area > 10_000 ? 18.0 : area > 3000 ? 14.0 : area > 800 ? 10.0 : 7.0;
      } else if (Set.of("industrial", "warehouse", "factory", "hangar").contains(type)) {
        h = area > 3000 ? 12.0 : 8.0;
      } else {
        // houses / generic: most Manila houses are 1-2 storeys
        h = area > 5000 ? 12.0 : area > 1500 ? 9.0 : area > 300 ? 7.0 : 6.0;
      }
    }
    double minH = 0;
    Double mh = parseLength(sf.getTag("min_height"));
    if (mh != null) minH = mh;
    else {
      Double ml = parseNum(sf.getTag("building:min_level"));
      if (ml != null) minH = ml * 3.0;
    }
    h = Math.max(1, Math.min(h, 400));
    minH = Math.max(0, Math.min(minH, h - 0.5));
    double hq = h <= 7.5 ? 6 : h <= 12 ? 10 : h <= 20 ? 15 : h <= 32 ? 25 : h <= 50 ? 40 : h <= 80 ? 60 :
      h <= 130 ? 100 : 160;
    var f = fc.polygon("building").setMinZoom(13)
      // z13: quantised heights so neighbouring buildings merge into blocks; z14: exact
      .setAttr("height", ZoomFunction.fromMaxZoomThresholds(Map.of(13, hq), Math.round(h * 10) / 10.0))
      .setMinPixelSizeBelowZoom(13, 1.0)
      .setMinPixelSize(1.0)
      .setPixelToleranceBelowZoom(13, 0.5)
      .setBufferPixels(2);
    if (minH > 0) f.setAttrWithMinzoom("min_height", Math.round(minH * 10) / 10.0, 14);
    String n = name(sf);
    if (n != null && (area > 2500 || h > 40)) f.setAttrWithMinzoom("name", n, 14);
  }

  // ---------------------------------------------------------------- roads

  record RoadClass(String cls, int minZoom, boolean ramp) {}

  static RoadClass roadClass(String hw) {
    return switch (hw) {
      case "motorway" -> new RoadClass("motorway", 5, false);
      case "motorway_link" -> new RoadClass("motorway", 9, true);
      case "trunk" -> new RoadClass("trunk", 5, false);
      case "trunk_link" -> new RoadClass("trunk", 10, true);
      case "primary" -> new RoadClass("primary", 8, false);
      case "primary_link" -> new RoadClass("primary", 11, true);
      case "secondary" -> new RoadClass("secondary", 9, false);
      case "secondary_link" -> new RoadClass("secondary", 12, true);
      case "tertiary" -> new RoadClass("tertiary", 11, false);
      case "tertiary_link" -> new RoadClass("tertiary", 12, true);
      case "residential", "unclassified", "living_street", "road" -> new RoadClass("minor", 12, false);
      case "service", "busway", "bus_guideway", "rest_area", "services", "escape", "emergency_bay" ->
        new RoadClass("service", 13, false);
      case "pedestrian", "footway", "path", "cycleway", "bridleway", "corridor", "platform" ->
        new RoadClass("path", 13, false);
      case "track" -> new RoadClass("track", 13, false);
      case "steps" -> new RoadClass("steps", 13, false);
      default -> null;
    };
  }

  void processRoad(SourceFeature sf, FeatureCollector fc) {
    String hw = sf.getString("highway");
    if (hw == null) return;
    RoadClass rc = roadClass(hw);
    if (rc == null) return;
    if (sf.hasTag("area", "yes") && sf.canBePolygon() && !"pedestrian".equals(hw)) return;
    if ("corridor".equals(hw) || "platform".equals(hw)) return; // indoor / platforms
    if (sf.hasTag("indoor", "yes")) return;
    var f = fc.line("road").setAttr("class", rc.cls).setMinZoom(rc.minZoom)
      .setMinPixelSize(0).setPixelTolerance(0.5).setPixelToleranceAtMaxZoom(0.25)
      .setSortKey(sf.getWayZorder());
    if (rc.ramp) f.setAttr("ramp", 1);
    int dir = sf.getDirection("oneway");
    if (sf.hasTag("junction", "roundabout", "circular") && !sf.hasTag("oneway", "no")) dir = 1;
    if (hw.startsWith("motorway") && !sf.hasTag("oneway", "no") && dir == 0) dir = 1;
    if (dir != 0) f.setAttrWithMinzoom("oneway", dir, 14);
    if (yes(sf, "bridge") || sf.hasTag("bridge", "viaduct")) f.setAttr("bridge", 1);
    if (yes(sf, "tunnel") || sf.hasTag("tunnel", "building_passage") || sf.hasTag("covered", "yes") && false)
      f.setAttr("tunnel", 1);
    Double layer = parseNum(sf.getTag("layer"));
    if (layer != null && layer != 0) f.setAttr("layer", (int) Math.max(-5, Math.min(5, layer)));
    String n = name(sf);
    if (n != null) f.setAttrWithMinzoom("name", n, Math.max(rc.minZoom, 10));
    String ref = sf.getString("ref");
    if (ref != null) f.setAttr("ref", ref);
    if (yes(sf, "toll")) f.setAttr("toll", 1);
  }

  void processRail(SourceFeature sf, FeatureCollector fc) {
    String r = sf.getString("railway");
    if (r == null) return;
    String cls = switch (r) {
      case "rail", "narrow_gauge" -> "rail";
      case "subway" -> "subway";
      case "light_rail" -> "light_rail";
      case "monorail" -> "monorail";
      case "tram" -> "tram";
      default -> null;
    };
    if (cls == null) return;
    boolean minor = sf.hasTag("service", "yard", "siding", "spur", "crossover");
    var f = fc.line("rail").setAttr("class", cls).setMinZoom(minor ? 13 : 9).setMinPixelSize(0)
      .setPixelTolerance(0.5);
    String n = name(sf);
    if (n != null) f.setAttrWithMinzoom("name", n, 12);
    if (yes(sf, "bridge") || sf.hasTag("bridge", "viaduct")) f.setAttr("bridge", 1);
    if (yes(sf, "tunnel")) f.setAttr("tunnel", 1);
  }

  // ---------------------------------------------------------------- aeroway

  void processAerowayLine(SourceFeature sf, FeatureCollector fc) {
    if (sf.hasTag("aeroway", "runway", "taxiway") && !sf.hasTag("area", "yes")) {
      String cls = sf.getString("aeroway");
      fc.line("aeroway").setAttr("class", cls).setMinZoom("runway".equals(cls) ? 11 : 12).setMinPixelSize(0);
    }
  }

  void processAerowayPolygon(SourceFeature sf, FeatureCollector fc) {
    if (sf.hasTag("aeroway", "apron") || (sf.hasTag("aeroway", "runway", "taxiway") && sf.hasTag("area", "yes"))) {
      fc.polygon("aeroway").setAttr("class", sf.getString("aeroway")).setMinZoom(11).setMinPixelSize(2);
    }
  }

  // ---------------------------------------------------------------- boundaries & places

  void processBoundary(SourceFeature sf, FeatureCollector fc) {
    if (!sf.hasRelationInfo()) return;
    if (sf.hasTag("natural", "coastline") || yes(sf, "maritime")) return;
    if (waterBoundaryWays.contains(sf.id())) return;
    int best = 99;
    for (var m : sf.relationInfo(AdminRel.class)) best = Math.min(best, m.relation().level());
    if (best == 6) {
      fc.line("boundary").setAttr("level", "city").setMinZoom(9).setMinPixelSize(0);
    } else if (best == 10) {
      fc.line("boundary").setAttr("level", "barangay").setMinZoom(13).setMinPixelSize(0);
    }
  }

  void processBarangayLabel(SourceFeature sf, FeatureCollector fc) throws GeometryException {
    if (!isRelation(sf) || !sf.hasTag("boundary", "administrative") || !sf.hasTag("admin_level", "10")) return;
    if (relationsWithLabelNode.contains(sf.id())) return;
    String n = name(sf);
    if (n == null) return;
    fc.innermostPoint("place").setAttr("class", "barangay").setAttr("name", n).setAttr("rank", 12)
      .setMinZoom(13).setBufferPixels(64);
  }

  void processPlace(SourceFeature sf, FeatureCollector fc) {
    String p = sf.getString("place");
    if (p == null) return;
    String n = name(sf);
    if (n == null) return;
    long pop = 0;
    Double pd = parseNum(sf.getString("population", "").replace(",", ""));
    if (pd != null) pop = pd.longValue();
    String cls;
    int minz;
    int rank;
    if (sf.hasTag("admin_level", "10") && !p.equals("city") && !p.equals("town")) p = "barangay";
    switch (p) {
      case "barangay" -> { cls = "barangay"; minz = 13; rank = 12; }
      case "city" -> {
        cls = "city"; minz = 8; rank = pop > 1_000_000 ? 1 : pop > 300_000 ? 2 : 3;
      }
      case "town", "municipality" -> { cls = "town"; minz = 8; rank = 4; }
      case "suburb", "borough" -> { cls = "suburb"; minz = 11; rank = 6; }
      case "quarter" -> { cls = "quarter"; minz = 12; rank = 8; }
      case "village" -> { cls = "village"; minz = 12; rank = 9; }
      case "neighbourhood", "subdivision", "gated_community" -> { cls = "neighbourhood"; minz = 13; rank = 10; }
      case "locality", "hamlet" -> { cls = "locality"; minz = 13; rank = 11; }
      default -> { return; }
    }
    fc.point("place").setAttr("class", cls).setAttr("name", n).setAttr("rank", rank).setMinZoom(minz)
      .setBufferPixels(64).setSortKey(rank);
  }

  // ---------------------------------------------------------------- POIs

  record Poi(String cls, String subclass, int rank, int minZoom) {}

  static Poi poiFor(SourceFeature sf) {
    String am = sf.getString("amenity");
    String sh = sf.getString("shop");
    String tou = sf.getString("tourism");
    String le = sf.getString("leisure");
    String rw = sf.getString("railway");
    String pt = sf.getString("public_transport");
    String ae = sf.getString("aeroway");
    String hw = sf.getString("highway");
    String off = sf.getString("office");
    String hist = sf.getString("historic");
    if ("aerodrome".equals(ae)) return new Poi("airport", ae, 1, 12);
    if ("terminal".equals(ae)) return new Poi("airport", ae, 2, 12);
    if (rw != null && (rw.equals("station") || rw.equals("halt"))) {
      return new Poi("train", sf.getString("station", rw), 3, 12);
    }
    if ("station".equals(pt) && (sf.hasTag("train", "yes") || sf.hasTag("subway", "yes") ||
      sf.hasTag("light_rail", "yes") || sf.hasTag("monorail", "yes"))) {
      return new Poi("train", "station", 3, 12);
    }
    if ("ferry_terminal".equals(am)) return new Poi("ferry", am, 6, 13);
    if ("bus_station".equals(am)) return new Poi("bus", am, 7, 13);
    if ("bus_stop".equals(hw) || ("platform".equals(pt) && sf.hasTag("bus", "yes"))) return new Poi("bus", "bus_stop", 18, 14);
    if (sh != null) {
      return switch (sh) {
        case "mall", "department_store" -> new Poi("mall", sh, 2, 12);
        case "supermarket", "wholesale" -> new Poi("supermarket", sh, 9, 14);
        case "convenience" -> new Poi("convenience", sh, 16, 14);
        case "chemist" -> new Poi("pharmacy", sh, 14, 14);
        case "vacant", "no", "yes" -> null;
        default -> new Poi("shop", sh, 17, 14);
      };
    }
    if (am != null) {
      return switch (am) {
        case "marketplace" -> new Poi("market", am, 8, 13);
        case "restaurant", "fast_food", "food_court", "ice_cream", "canteen" -> new Poi("food", am, 15, 14);
        case "cafe" -> new Poi("cafe", am, 15, 14);
        case "bar", "pub", "nightclub", "biergarten" -> new Poi("bar", am, 16, 14);
        case "bank", "bureau_de_change", "money_transfer" -> new Poi("bank", am, 14, 14);
        case "atm" -> new Poi("atm", am, 19, 14);
        case "hospital" -> new Poi("hospital", am, 3, 12);
        case "clinic", "doctors", "dentist", "health_post" -> new Poi("clinic", am, 13, 14);
        case "pharmacy" -> new Poi("pharmacy", am, 14, 14);
        case "school", "kindergarten" -> new Poi("school", am, 10, 14);
        case "university", "college" -> new Poi("university", am, 5, 13);
        case "place_of_worship" -> {
          String rel = sf.getString("religion", "");
          String cls = switch (rel) {
            case "christian" -> "church";
            case "muslim" -> "mosque";
            default -> "temple";
          };
          yield new Poi(cls, rel.isEmpty() ? am : rel, 11, 14);
        }
        case "fuel" -> new Poi("fuel", am, 12, 14);
        case "charging_station" -> new Poi("charging", am, 16, 14);
        case "parking" -> new Poi("parking", am, 18, 14);
        case "townhall", "courthouse", "embassy" -> new Poi("government", am, 6, 13);
        case "police" -> new Poi("police", am, 11, 14);
        case "fire_station" -> new Poi("fire", am, 12, 14);
        case "post_office" -> new Poi("post", am, 12, 14);
        case "cinema", "theatre" -> new Poi("cinema", am, 12, 14);
        case "library" -> new Poi("library", am, 12, 14);
        case "toilets" -> new Poi("toilet", am, 19, 14);
        case "community_centre", "social_facility", "arts_centre", "events_venue", "conference_centre",
          "veterinary", "car_wash", "car_rental", "childcare", "internet_cafe", "public_bath" ->
          new Poi("other", am, 17, 14);
        default -> null;
      };
    }
    if (tou != null) {
      return switch (tou) {
        case "hotel", "hostel", "guest_house", "motel", "apartment" -> new Poi("hotel", tou, 12, 14);
        case "museum", "gallery" -> new Poi("museum", tou, 8, 13);
        case "attraction", "viewpoint", "theme_park", "zoo", "aquarium", "artwork" ->
          new Poi("attraction", tou, "artwork".equals(tou) ? 16 : 7, 13);
        default -> null;
      };
    }
    if (le != null) {
      return switch (le) {
        case "park", "garden", "nature_reserve" -> new Poi("park", le, 8, 13);
        case "fitness_centre" -> new Poi("gym", le, 16, 14);
        case "sports_centre", "stadium", "golf_course", "swimming_pool", "pitch", "sports_hall" ->
          new Poi("sports", le, "stadium".equals(le) ? 7 : 15, 14);
        default -> null;
      };
    }
    if (off != null && off.equals("government")) return new Poi("government", off, 9, 14);
    if (hist != null && Set.of("monument", "memorial", "church", "fort", "castle", "ruins", "building")
      .contains(hist)) {
      return new Poi("attraction", hist, 9, 14);
    }
    return null;
  }

  // ---------------------------------------------------------------- house numbers

  void processHousenumber(SourceFeature sf, FeatureCollector fc) throws GeometryException {
    String hn = sf.getString("addr:housenumber");
    if (hn == null || hn.isBlank() || hn.length() > 12) return;
    if (sf.canBeLine() && !sf.canBePolygon()) return;
    if (isRelation(sf) && !sf.hasTag("type", "multipolygon")) return;
    (sf.isPoint() ? fc.point("housenumber") : fc.pointOnSurface("housenumber"))
      .setAttr("housenumber", hn.trim()).setMinZoom(14).setBufferPixels(8);
  }

  void processPoi(SourceFeature sf, FeatureCollector fc) throws GeometryException {
    if (isRelation(sf) && sf.hasTag("type", "boundary")) return;
    if (sf.canBeLine() && !sf.canBePolygon()) return; // POIs from nodes and areas only
    Poi poi = poiFor(sf);
    if (poi == null) return;
    String n = name(sf);
    boolean unnamedOk = poi.cls.equals("toilet") || poi.cls.equals("atm");
    if (n == null && !unnamedOk) return;
    int rank = poi.rank;
    int minz = poi.minZoom;
    if (sf.canBePolygon()) {
      double m2 = sf.areaMeters();
      // big areas are more important
      if (m2 > 50_000) {
        rank = Math.max(1, rank - 2);
        minz = Math.min(minz, 12);
      } else if (m2 > 10_000) {
        rank = Math.max(1, rank - 1);
        minz = Math.min(minz, 13);
      }
    }
    var f = (sf.isPoint() ? fc.point("poi") : fc.pointOnSurface("poi"))
      .setAttr("class", poi.cls).setAttr("subclass", poi.subclass).setAttr("rank", rank)
      .setMinZoom(minz).setBufferPixels(32).setSortKey(rank)
      .setPointLabelGridSizeAndLimit(13, 32, 6);
    if (n != null) f.setAttr("name", n);
  }

  // ---------------------------------------------------------------- post-processing

  @Override
  public List<VectorTile.Feature> postProcessLayerFeatures(String layer, int zoom, List<VectorTile.Feature> items)
    throws GeometryException {
    if (zoom >= 14) return items;
    switch (layer) {
      case "road", "rail", "waterway", "boundary" -> {
        return FeatureMerge.mergeLineStrings(items, zoom < 13 ? 0.5 : 0.25, 0.25, 4);
      }
      case "building" -> {
        return FeatureMerge.mergeNearbyPolygons(items, 1.0, 1.0, 0.25, 2);
      }
      case "landuse", "water" -> {
        return FeatureMerge.mergeNearbyPolygons(items, 1.0, 1.0, 0.25, 4);
      }
      default -> {
        return items;
      }
    }
  }

  // ---------------------------------------------------------------- main

  public static void main(String[] args) throws Exception {
    Arguments arguments = Arguments.fromArgsOrConfigFile(args).orElse(Arguments.of(Map.of(
      "minzoom", "0", "maxzoom", "14")));
    Path osm = arguments.inputFile("osm_path", "OSM input file", Path.of("data/metro_manila.osm.pbf"));
    Path water = arguments.inputFile("water_path", "water polygons GeoJSON", Path.of("data/work/water.geojson"));
    Path out = arguments.file("output", "output pmtiles", Path.of("data/work/tiles.pmtiles"));
    Path skipWays = arguments.file("water_boundaries", "boundary way ids to drop", Path.of("data/work/water_boundaries.txt"));
    Set<Long> skip = new java.util.HashSet<>();
    if (java.nio.file.Files.exists(skipWays)) {
      for (String line : java.nio.file.Files.readAllLines(skipWays)) {
        if (!line.isBlank()) skip.add(Long.parseLong(line.trim()));
      }
    }
    Planetiler.create(arguments)
      .setProfile(new ManilaProfile(skip))
      .addOsmSource("osm", osm)
      .addGeoJsonSource("water", water)
      .overwriteOutput(out)
      .run();
  }
}
