import { memo } from 'react';
import type { ItemShape } from '@/domain/types';

/**
 * Procedural low-poly item meshes. Every shape fits roughly in a 0.4 × 0.5 × 0.4 box
 * with its base at y = 0 so it sits on a shelf. `color` is the category hue.
 */
type P = { color: string; lit?: boolean };

const M = ({ c, e = 0, metal = 0, rough = .85, op }: { c: string; e?: number; metal?: number; rough?: number; op?: number }) => (
  <meshStandardMaterial color={c} emissive={e ? c : '#000'} emissiveIntensity={e} metalness={metal} roughness={rough} flatShading transparent={op !== undefined} opacity={op ?? 1} />
);

function Bottle({ color }: P) {
  return (
    <group>
      <mesh position={[0, .16, 0]}><cylinderGeometry args={[.09, .1, .32, 9]} />{M({ c: color, rough: .35, op: .85 })}</mesh>
      <mesh position={[0, .36, 0]}><cylinderGeometry args={[.04, .07, .08, 9]} />{M({ c: color, rough: .35, op: .85 })}</mesh>
      <mesh position={[0, .43, 0]}><cylinderGeometry args={[.045, .045, .06, 9]} />{M({ c: '#ffffff' })}</mesh>
      <mesh position={[0, .17, 0]}><cylinderGeometry args={[.101, .101, .12, 9]} />{M({ c: '#ffffff' })}</mesh>
    </group>
  );
}
function Gallon({ color }: P) {
  return (
    <group>
      <mesh position={[0, .26, 0]}><cylinderGeometry args={[.17, .19, .52, 10]} />{M({ c: color, rough: .35, op: .8 })}</mesh>
      <mesh position={[0, .56, 0]}><cylinderGeometry args={[.07, .11, .1, 10]} />{M({ c: color, rough: .35, op: .8 })}</mesh>
      <mesh position={[0, .62, 0]}><cylinderGeometry args={[.08, .08, .05, 10]} />{M({ c: '#3a7bd5' })}</mesh>
      <mesh position={[0, .2, 0]}><cylinderGeometry args={[.192, .192, .06, 10]} />{M({ c: '#2b64b8', rough: .5, op: .9 })}</mesh>
    </group>
  );
}
function Drum({ color }: P) {
  return (
    <group>
      <mesh position={[0, .42, 0]}><cylinderGeometry args={[.3, .3, .84, 12]} />{M({ c: color, rough: .6 })}</mesh>
      {[.2, .64].map((y) => <mesh key={y} position={[0, y, 0]}><cylinderGeometry args={[.315, .315, .05, 12]} />{M({ c: '#1f4d80' })}</mesh>)}
      <mesh position={[0, .86, 0]}><cylinderGeometry args={[.3, .3, .04, 12]} />{M({ c: '#1f4d80' })}</mesh>
    </group>
  );
}
function Can({ color }: P) {
  return (
    <group>
      <mesh position={[0, .12, 0]}><cylinderGeometry args={[.12, .12, .24, 12]} />{M({ c: '#c9d1dc', metal: .7, rough: .35 })}</mesh>
      <mesh position={[0, .12, 0]}><cylinderGeometry args={[.122, .122, .15, 12]} />{M({ c: color })}</mesh>
      <mesh position={[0, .245, 0]}><cylinderGeometry args={[.1, .1, .01, 12]} />{M({ c: '#9aa5b3', metal: .8, rough: .3 })}</mesh>
    </group>
  );
}
function Sack({ color }: P) {
  return (
    <group>
      <mesh position={[0, .2, 0]} scale={[1, 1.1, .8]}><sphereGeometry args={[.2, 7, 6]} />{M({ c: '#e8d9b8' })}</mesh>
      <mesh position={[0, .43, 0]}><sphereGeometry args={[.06, 6, 5]} />{M({ c: color })}</mesh>
      <mesh position={[0, .2, .16]}><boxGeometry args={[.18, .12, .01]} />{M({ c: color })}</mesh>
    </group>
  );
}
function BoxShape({ color }: P) {
  return (
    <group>
      <mesh position={[0, .13, 0]}><boxGeometry args={[.34, .26, .3]} />{M({ c: '#d9a96c' })}</mesh>
      <mesh position={[0, .265, 0]}><boxGeometry args={[.1, .01, .31]} />{M({ c: color })}</mesh>
      <mesh position={[0, .13, .151]}><boxGeometry args={[.16, .1, .01]} />{M({ c: color })}</mesh>
    </group>
  );
}
function Pouch({ color }: P) {
  return (
    <group>
      <mesh position={[0, .16, 0]}><boxGeometry args={[.26, .32, .1]} />{M({ c: color, rough: .6 })}</mesh>
      <mesh position={[0, .3, 0]}><boxGeometry args={[.27, .04, .11]} />{M({ c: '#ffffff' })}</mesh>
      <mesh position={[0, .15, .051]}><boxGeometry args={[.14, .14, .01]} />{M({ c: '#ffffff' })}</mesh>
    </group>
  );
}
function Jar({ color }: P) {
  return (
    <group>
      <mesh position={[0, .15, 0]}><cylinderGeometry args={[.12, .12, .3, 10]} />{M({ c: '#dff4ff', rough: .2, op: .6 })}</mesh>
      <mesh position={[0, .12, 0]}><cylinderGeometry args={[.1, .1, .2, 10]} />{M({ c: color })}</mesh>
      <mesh position={[0, .32, 0]}><cylinderGeometry args={[.125, .125, .05, 10]} />{M({ c: '#c58a3d', metal: .4 })}</mesh>
    </group>
  );
}
function Lamp({ color, lit }: P) {
  return (
    <group>
      <mesh position={[0, .05, 0]}><cylinderGeometry args={[.12, .14, .1, 10]} />{M({ c: '#2b3240' })}</mesh>
      <mesh position={[0, .25, 0]}><cylinderGeometry args={[.09, .11, .3, 10]} />{M({ c: lit ? '#fff2c4' : '#d9d2b8', e: lit ? 1.6 : 0, rough: .4 })}</mesh>
      <mesh position={[0, .42, 0]}><cylinderGeometry args={[.1, .12, .05, 10]} />{M({ c: color })}</mesh>
      <mesh position={[0, .48, 0]}><torusGeometry args={[.06, .012, 6, 10]} />{M({ c: '#2b3240' })}</mesh>
      {lit && <pointLight position={[0, .3, 0]} intensity={1.6} distance={2.8} color="#ffe2a8" decay={2} />}
    </group>
  );
}
function Battery({ color }: P) {
  return (
    <group>
      {[-.07, .07].map((x) => (
        <group key={x} position={[x, 0, 0]}>
          <mesh position={[0, .14, 0]}><cylinderGeometry args={[.05, .05, .28, 10]} />{M({ c: '#2b3240' })}</mesh>
          <mesh position={[0, .18, 0]}><cylinderGeometry args={[.052, .052, .12, 10]} />{M({ c: color })}</mesh>
          <mesh position={[0, .3, 0]}><cylinderGeometry args={[.02, .02, .03, 8]} />{M({ c: '#c9d1dc', metal: .8 })}</mesh>
        </group>
      ))}
    </group>
  );
}
function Radio({ color }: P) {
  return (
    <group>
      <mesh position={[0, .13, 0]}><boxGeometry args={[.36, .26, .14]} />{M({ c: '#2b3240' })}</mesh>
      <mesh position={[-.07, .13, .071]}><cylinderGeometry args={[.08, .08, .01, 12]} />{M({ c: color })}</mesh>
      <mesh position={[.1, .17, .071]}><boxGeometry args={[.1, .05, .01]} />{M({ c: '#9fe8ff', e: .6 })}</mesh>
      <mesh position={[.1, .08, .075]}><cylinderGeometry args={[.025, .025, .02, 8]} />{M({ c: '#c9d1dc' })}</mesh>
      <mesh position={[.14, .4, 0]} rotation={[0, 0, -.3]}><cylinderGeometry args={[.008, .008, .3, 6]} />{M({ c: '#c9d1dc', metal: .8 })}</mesh>
    </group>
  );
}
function Powerbank({ color }: P) {
  return (
    <group>
      <mesh position={[0, .04, 0]}><boxGeometry args={[.3, .08, .15]} />{M({ c: '#2b3240', rough: .5 })}</mesh>
      <mesh position={[.1, .081, 0]}><boxGeometry args={[.06, .005, .06]} />{M({ c: color, e: 1 })}</mesh>
      <mesh position={[0, .11, 0]}><boxGeometry args={[.3, .07, .15]} />{M({ c: '#3a4356', rough: .5 })}</mesh>
    </group>
  );
}
function Panel({ color }: P) {
  return (
    <group rotation={[-.5, 0, 0]} position={[0, .05, 0]}>
      <mesh position={[0, .2, 0]}><boxGeometry args={[.42, .4, .03]} />{M({ c: '#1b2c4a' })}</mesh>
      {[-.14, 0, .14].map((x) => [.07, .2, .33].map((y) => (
        <mesh key={`${x}${y}`} position={[x, y, .016]}><boxGeometry args={[.12, .11, .005]} />{M({ c: '#2e5aa8', metal: .5, rough: .3 })}</mesh>
      )))}
      <mesh position={[0, .2, .02]}><boxGeometry args={[.42, .01, .005]} />{M({ c: color })}</mesh>
    </group>
  );
}
function Bag({ color }: P) {
  return (
    <group>
      <mesh position={[0, .2, 0]}><boxGeometry args={[.3, .4, .2]} />{M({ c: color, rough: .7 })}</mesh>
      <mesh position={[0, .16, .11]}><boxGeometry args={[.22, .18, .04]} />{M({ c: '#2b3240' })}</mesh>
      <mesh position={[0, .44, 0]}><torusGeometry args={[.07, .018, 6, 10]} />{M({ c: '#2b3240' })}</mesh>
      <mesh position={[0, .34, -.11]}><boxGeometry args={[.26, .06, .02]} />{M({ c: '#2b3240' })}</mesh>
    </group>
  );
}
function Kit({ color }: P) {
  return (
    <group>
      <mesh position={[0, .13, 0]}><boxGeometry args={[.36, .26, .22]} />{M({ c: '#ffffff' })}</mesh>
      <mesh position={[0, .14, .111]}><boxGeometry args={[.14, .05, .01]} />{M({ c: color })}</mesh>
      <mesh position={[0, .14, .111]}><boxGeometry args={[.05, .14, .01]} />{M({ c: color })}</mesh>
      <mesh position={[0, .28, 0]}><boxGeometry args={[.14, .04, .04]} />{M({ c: '#2b3240' })}</mesh>
    </group>
  );
}
function Roll({ color }: P) {
  return (
    <group>
      <mesh position={[0, .12, 0]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[.12, .12, .3, 12]} />{M({ c: color })}</mesh>
      <mesh position={[0, .12, 0]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[.05, .05, .32, 10]} />{M({ c: '#d9a96c' })}</mesh>
    </group>
  );
}
function Rope({ color }: P) {
  return (
    <group>
      {[0, .05, .1].map((y, i) => <mesh key={i} position={[0, .04 + y, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[.14 - i * .01, .035, 6, 14]} />{M({ c: color, rough: .9 })}</mesh>)}
    </group>
  );
}
function Tarp({ color }: P) {
  return (
    <group>
      <mesh position={[0, .07, 0]}><boxGeometry args={[.4, .14, .3]} />{M({ c: color, rough: .7 })}</mesh>
      <mesh position={[0, .15, 0]}><boxGeometry args={[.36, .03, .26]} />{M({ c: '#ffffff', rough: .7 })}</mesh>
      <mesh position={[0, .18, 0]}><boxGeometry args={[.42, .02, .06]} />{M({ c: '#2b3240' })}</mesh>
    </group>
  );
}
function Tool({ color }: P) {
  return (
    <group rotation={[0, 0, .35]} position={[0, .02, 0]}>
      <mesh position={[0, .2, 0]}><cylinderGeometry args={[.03, .035, .36, 8]} />{M({ c: '#8b5a2b' })}</mesh>
      <mesh position={[0, .4, 0]}><boxGeometry args={[.22, .1, .09]} />{M({ c: '#9aa5b3', metal: .7, rough: .35 })}</mesh>
      <mesh position={[0, .07, 0]}><cylinderGeometry args={[.04, .04, .1, 8]} />{M({ c: color })}</mesh>
    </group>
  );
}
function Cash({ color }: P) {
  return (
    <group>
      {[0, 1, 2, 3].map((i) => <mesh key={i} position={[(i % 2) * .02, .02 + i * .035, 0]} rotation={[0, (i % 2) * .15, 0]}><boxGeometry args={[.32, .03, .15]} />{M({ c: i % 2 ? color : '#c9e8b5' })}</mesh>)}
      <mesh position={[0, .09, 0]}><boxGeometry args={[.1, .15, .16]} />{M({ c: '#e9c46a' })}</mesh>
    </group>
  );
}
function Doc({ color }: P) {
  return (
    <group>
      <mesh position={[0, .03, 0]}><boxGeometry args={[.3, .06, .22]} />{M({ c: '#f7f4ea' })}</mesh>
      <mesh position={[0, .065, 0]}><boxGeometry args={[.08, .01, .24]} />{M({ c: color })}</mesh>
      <mesh position={[.06, .066, -.03]}><boxGeometry args={[.1, .005, .02]} />{M({ c: '#9aa5b3' })}</mesh>
      <mesh position={[.06, .066, .02]}><boxGeometry args={[.14, .005, .02]} />{M({ c: '#9aa5b3' })}</mesh>
    </group>
  );
}
function Bowl({ color }: P) {
  return (
    <group>
      <mesh position={[0, .08, 0]}><cylinderGeometry args={[.17, .1, .16, 12]} />{M({ c: color })}</mesh>
      <mesh position={[0, .165, 0]}><cylinderGeometry args={[.15, .15, .01, 12]} />{M({ c: '#4fb8ff', rough: .3 })}</mesh>
      <mesh position={[.2, .04, .05]} rotation={[0, 0, .4]}><cylinderGeometry args={[.05, .05, .08, 8]} />{M({ c: '#ff8a66' })}</mesh>
    </group>
  );
}
function Whistle({ color }: P) {
  return (
    <group rotation={[0, .4, 0]}>
      <mesh position={[0, .07, 0]}><boxGeometry args={[.22, .09, .08]} />{M({ c: color })}</mesh>
      <mesh position={[-.08, .12, 0]}><cylinderGeometry args={[.06, .06, .08, 10]} />{M({ c: color })}</mesh>
      <mesh position={[.1, .17, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[.05, .01, 6, 10]} />{M({ c: '#2b3240' })}</mesh>
    </group>
  );
}
function Mask({ color }: P) {
  return (
    <group>
      <mesh position={[0, .1, 0]}><boxGeometry args={[.3, .2, .08]} />{M({ c: '#ffffff' })}</mesh>
      <mesh position={[0, .19, 0]}><boxGeometry args={[.3, .03, .085]} />{M({ c: color })}</mesh>
      <mesh position={[0, .1, .045]}><boxGeometry args={[.12, .06, .005]} />{M({ c: color })}</mesh>
    </group>
  );
}
function Lock({ color }: P) {
  return (
    <group>
      <mesh position={[0, .12, 0]}><boxGeometry args={[.22, .2, .1]} />{M({ c: color, metal: .5, rough: .4 })}</mesh>
      <mesh position={[0, .26, 0]}><torusGeometry args={[.07, .02, 6, 12, Math.PI]} />{M({ c: '#9aa5b3', metal: .8, rough: .3 })}</mesh>
      <mesh position={[0, .1, .051]}><cylinderGeometry args={[.025, .025, .01, 8]} />{M({ c: '#2b3240' })}</mesh>
    </group>
  );
}

const SHAPES: Record<ItemShape, (p: P) => React.JSX.Element> = {
  bottle: Bottle, gallon: Gallon, drum: Drum, can: Can, sack: Sack, box: BoxShape, pouch: Pouch, jar: Jar,
  lamp: Lamp, battery: Battery, radio: Radio, powerbank: Powerbank, panel: Panel, bag: Bag, kit: Kit, roll: Roll,
  rope: Rope, tarp: Tarp, tool: Tool, cash: Cash, doc: Doc, bowl: Bowl, whistle: Whistle, mask: Mask, lock: Lock,
};

export const ItemMesh = memo(function ItemMesh({ shape, color, lit }: { shape: ItemShape; color: string; lit?: boolean }) {
  const S = SHAPES[shape] ?? BoxShape;
  return <S color={color} lit={lit} />;
});
