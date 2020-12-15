/* eslint-disable */
function createArray(length) {
	const arr = Array(length);
	for (var i=0; i<length; i++) {
		arr[i] = 0;
	}
	return arr;
}

function createArrays(length1, length2) {
	const arr = Array(length1);
	for (var i=0; i<length1; i++) {
		arr[i] = Array(length2);
		for (var j=0; j<length2; j++) {
			arr[i][j] = 0;
		}
	}
	return arr;
}

function bitOdd(i) {
	i ^= i >>> 1;
	i ^= i >>> 2;
	i ^= i >>> 4;
	i ^= i >>> 8;
	return i & 1;
}

function bitCount(i) {
	i = i - ((i >>> 1) & 0x55555555);
	i = (i & 0x33333333) + ((i >>> 2) & 0x33333333);
	return (i + (i >>> 8) + (i >>> 4)) & 0x0f;
}

function get4Parity(idx) {
	var p = 0;
	for (var i=2; i>=0; i--) {
		p += idx % (4-i);
		idx = ~~(idx / (4-i));
	}
	p &= 1;
	return p;
}

function get8Parity(idx) {
	var p = 0;
	for (var i=6; i>=0; i--) {
		p += idx % (8-i);
		idx = ~~(idx / (8-i));
	}
	p &= 1;
	return p;
}

function get12Parity(idx) {
	var p = 0;
	for (var i=10; i>=0; i--) {
		p += idx % (12-i);
		idx = ~~(idx / (12-i));
	}
	p &= 1;
	return p;
}


function binarySearch(arr, key) {
	var length = arr.length;
	if (key <= arr[length-1]) {
		var l = 0;
		var r = length-1;
		while (l <= r) {
			var mid = (l+r)>>>1;
			var val = arr[mid];
			if (key > val) {
				l = mid + 1;
			} else if (key < val) {
				r = mid - 1;
			} else {
				return (mid);
			}
		}
	}
	return 0xffff;
}

var fact = [1, 1, 2, 6, 24, 120, 720, 5040, 40320, 362880, 3628800, 39916800, 479001600];
var perm3 = [[11, 10, 9], [10, 11, 9], [11, 9, 10], [9, 11, 10], [10, 9, 11], [9, 10, 11]];
var ud2std = [0, 1, 2, 4, 7, 9, 10, 11, 13, 16];
var std2ud = createArray(18);
var Cnk = createArrays(12, 13);
var move2str = ["U ", "U2", "U'", "R ", "R2", "R'", "F ", "F2", "F'", "D ", "D2", "D'", "L ", "L2", "L'", "B ", "B2", "B'"];
var urfMove = [[0, 1, 2, 3, 4, 5, 6, 7, 8, 9,10,11,12,13,14,15,16,17], 
											[6, 7, 8, 0, 1, 2, 3, 4, 5,15,16,17, 9,10,11,12,13,14],
											[3, 4, 5, 6, 7, 8, 0, 1, 2,12,13,14,15,16,17, 9,10,11],
											[2, 1, 0, 5, 4, 3, 8, 7, 6,11,10, 9,14,13,12,17,16,15], 
											[8, 7, 6, 2, 1, 0, 5, 4, 3,17,16,15,11,10, 9,14,13,12],
											[5, 4, 3, 8, 7, 6, 2, 1, 0,14,13,12,17,16,15,11,10, 9]];
for (var i=0; i<12; i++) {
	Cnk[i][0] = 1;
	Cnk[i][i] = 1;
	Cnk[i][i+1] = 0;
	for (var j=1; j<i; j++) {
		Cnk[i][j] = (Cnk[i-1][j-1] + Cnk[i-1][j]);
	}
}
for (var i=0; i<10; i++) {
	std2ud[ud2std[i]] = i;
}

var ckmv = Array(19);//new boolean[19][18];
var ckmv2 = Array(11);//new boolean[11][10];
ckmv[18] = Array(18);
ckmv2[10] = Array(10);
for (var i=0; i<18; i++) {
	ckmv[i] = Array(18);
	for (var j=0; j<18; j++) {
		ckmv[i][j] = (~~(i/3) == ~~(j/3)) || ((~~(i/3)%3 == ~~(j/3)%3) && (i>=j));
	}
	ckmv[18][i] = false;
}
for (var i=0; i<10; i++) {
	ckmv2[i] = Array(10);
	for (var j=0; j<10; j++) {
		ckmv2[i][j] = ckmv[ud2std[i]][ud2std[j]];
	}
	ckmv2[10][i] = false;
}


//********************************************************************************//

function CubieCube() {
	this.cp = [0, 1, 2, 3, 4, 5, 6, 7];
	this.co = [0, 0, 0, 0, 0, 0, 0, 0];
	this.ep = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
	this.eo = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
	this.getFlip = function getFlip() {
		var idx = 0;
		for (var i=0; i<11; i++) {
			idx |= this.eo[i] << i;
		}
		return idx;
	}
	
	this.getFlipSym = function getFlipSym() {
		if (FlipR2S != 0) {
			return FlipR2S[this.getFlip()];
		}
		for (var k=0; k<16; k+=2) {
			EdgeConjugate(this, SymInv[k], temps);
			var idx = binarySearch(FlipS2R, temps.getFlip());
			if (idx != 0xffff) {
				return ((idx << 3) | (k >>> 1));
			}
		}
		return 0;
	}

	this.setFlip = function setFlip(idx) {
		this.eo[11] = bitOdd(idx);
		for (var i=0; i<11; i++) {
			this.eo[i] = idx & 1;
			idx >>>= 1;
		}
	}
	
	this.getTwist = function getTwist() {
		var idx = 0;
		for (var i=0; i<7; i++) {
			idx *= 3;
			idx += this.co[i];
		}
		return idx;
	}
	
	this.getTwistSym = function getTwistSym() {
		if (TwistR2S != null) {
			return TwistR2S[this.getTwist()];
		}
		for (var k=0; k<16; k+=2) {
			CornConjugate(this, SymInv[k], temps);
			let idx = binarySearch(TwistS2R, temps.getTwist());
			if (idx != 0xffff) {
				return ((idx << 3) | (k >>> 1));
			}
		}
		return 0;
	}


	this.setTwist = function setTwist(idx) {
		var twst = 0;
		for (var i=6; i>=0; i--) {
			twst += this.co[i] = idx % 3;
			idx = ~~(idx/3);
		}
		this.co[7] = (15 - twst) % 3;
	}
	
	this.getUDSlice = function getUDSlice() {
		var idx = 0;
		var r = 4;
		for (var i=0; i<12; i++) {
			if (this.ep[i] >= 8) {
				idx += Cnk[11-i][r];
				r--;
			}
		}
		return idx;
	}

	this.setUDSlice = function setUDSlice(idx) {
		var r = 4;
		for (var i=0; i<12; i++) {
			if (idx >= Cnk[11-i][r]) {
				idx -= Cnk[11-i][r];
				r--;
				this.ep[i] = (11-r);
			} else {
				this.ep[i] = (i+r-4);
			}
		}
	}
	this.getMPerm = function getMPerm() {
		var m = (1 << this.ep[11]);		
		var idx = 0;
		for (var i=10; i>=8; --i) {
			var t = 1 << this.ep[i];
			idx += bitCount(m & (t - 1)) * fact[11-i];
			m |= t;
		}
		return idx;
	}	
	this.setMPerm = function setMPerm(idx) {
		this.ep[11] = 8;
		for (var i=10; i>=8; i--) {
			this.ep[i] = (idx % (12-i) + 8);
			idx = ~~(idx / (12-i));
			for (var j=i+1; j<12; j++) {
				if (this.ep[j] >= this.ep[i])
					this.ep[j]++;
			}
		}	
	}
	
	this.getMid3 = function getMid3() {
		var idxA = 0;
		var idxB = 0;
		var mask = 0;
		var r = 3;
		for (var i=11; i>=0; i--) {
			if (this.ep[i] >= 9) {
				idxA += Cnk[i][r--];
				var t = 1 << this.ep[i];
				idxB += bitCount(mask & (t - 1)) * fact[2-r];
				mask |= t;
			}
		}
		return (idxA * 6 + idxB);
	}
	
	this.setMid3 = function setMid3(idxA) {
		var edge = perm3[idxA % 6];
		idxA = ~~(idxA / 6);
		var r = 3;
		for (var i=11; i>=0; i--) {
			if (idxA >= Cnk[i][r]) {
				idxA -= Cnk[i][r--];
				this.ep[i] = edge[2-r];
			} else {
				this.ep[i] = (8-i+r);
			}
		}	
	}
	
	this.getURtoUL = function getURtoUL() {
		var idxA = 0;
		var idxB = 0;
		var mask = 0;
		var r = 3;
		for (var i=11; i>=0; i--) {
			if (this.ep[i] <= 2) {
				idxA += Cnk[i][r--];
				var t = 1 << this.ep[i];
				idxB += bitCount(mask & (t - 1)) * fact[2-r];
				mask |= t;
			}
		}
		return (idxA * 6 + idxB);	
	}

	this.getDRtoDL = function getDRtoDL() {
		var idxA = 0;
		var idxB = 0;
		var mask = 0;
		var r = 3;
		for (var i=11; i>=0; i--) {
			if (4 <= this.ep[i] && this.ep[i] <= 6) {
				idxA += Cnk[i][r--];
				var t = 1 << this.ep[i];
				idxB += bitCount(mask & (t - 1)) * fact[2-r];
				mask |= t;
			}
		}
		return (idxA * 6 + idxB);	
	}	

	this.setEdgePerm = function setEdgePerm(idx) {
		this.ep[11] = 0;
		for (var i=10; i>=0; i--) {
			this.ep[i] = (idx % (12-i));
			idx = ~~(idx/(12-i));
			for (var j=i+1; j<12; j++) {
				if (this.ep[j] >= this.ep[i])
					this.ep[j]++;
			}
		}			
	}
	
	this.getEdgePerm = function getEdgePerm() {
		var m = (1 << this.ep[11]);		
		var idx = 0;
		for (var i=10; i>=0; --i) {
			var t = 1 << this.ep[i];
			idx += bitCount(m & (t - 1)) * fact[11-i];
			m |= t;
		}
		return idx;		
	}

	this.getCPermSym = function getCPermSym() {
		if (EPermR2S != null) {
			var idx = EPermR2S[get8Perm(this.cp)];
			idx ^= e2c[idx&0x0f];
			return idx;
		}
		for (var k=0; k<16; k++) {
			CornConjugate(this, SymInv[k], temps);
			var idx = binarySearch(CPermS2R, get8Perm(temps.cp));
			if (idx != 0xffff) {
				return ((idx << 4) | k);
			}
		}
		return 0;
	}
	
	this.getEPermSym = function getEPermSym() {	
		if (EPermR2S != null) {
			return EPermR2S[get8Perm(this.ep)];
		}
		for (var k=0; k<16; k++) {
			EdgeConjugate(this, SymInv[k], temps);
			var idx = binarySearch(EPermS2R, get8Perm(temps.ep));
			if (idx != 0xffff) {
				return ((idx << 4) | k);
			}
		}
		return 0;
	}	

	this.URFConjugate = function URFConjugate() {
		CornMult(urf2, this, temps);
		CornMult(temps, urf1, this);		
		EdgeMult(urf2, this, temps);
		EdgeMult(temps, urf1, this);		    		
	}
	
	this.invCubieCube = function invCubieCube() {
		for (var edge=0; edge<12; edge++)
			temps.ep[this.ep[edge]] = edge;
		for (var edge=0; edge<12; edge++)
			temps.eo[edge] = this.eo[temps.ep[edge]];
		for (var corn=0; corn<8; corn++)
			temps.cp[this.cp[corn]] = corn;
		for (var corn=0; corn<8; corn++) {
			var ori = this.co[temps.cp[corn]];
			temps.co[corn] = -ori;
			if (temps.co[corn] < 0)
				temps.co[corn] += 3;
		}
		this.copy(temps);
	}


	this.init = function init(cperm, twist, eperm, flip) {
		set8Perm(this.cp, cperm);
		this.setTwist(twist);
		this.setEdgePerm(eperm);
		this.setFlip(flip);
	}
	
	this.copy = function copy(c) {
		for (var i=0; i<8; i++) {
			this.cp[i] = c.cp[i];
			this.co[i] = c.co[i];
		}
		for (var i = 0; i < 12; i++) {
			this.ep[i] = c.ep[i];
			this.eo[i] = c.eo[i];
		}
	}
}

const cctemp = new CubieCube();
const temps = new CubieCube();

function set8Perm(arr, idx) {
	var val = 0x76543210;
	for (var i=0; i<7; i++) {
		var p = fact[7-i];
		var v = ~~(idx / p);
		idx %= p;
		v <<= 2;
		arr[i] = ((val >> v) & 7);
		var m = (1 << v) - 1;
		val = (val & m) + ((val >> 4) & ~m);
	}
	arr[7] = val;
}

function get8Perm(arr) {
	var idx = 0;
	var val = 0x76543210;
	for (var i=0; i<7; i++) {
		var v = arr[i] << 2;
		idx = (8 - i) * idx + ((val >> v) & 7);
		val -= 0x11111110 << v;
	}
	return idx;	
}

function CornMult(a, b, prod) {
	for (var corn=0; corn<8; corn++) {
		prod.cp[corn] = a.cp[b.cp[corn]];
		var oriA = a.co[b.cp[corn]];
		var oriB = b.co[corn];
		var ori = oriA;
		ori += (oriA<3) ? oriB : 3-oriB;
		ori %= 3;
		if (oriA < 3 ^ oriB < 3) {
			ori += 3;
		}
		prod.co[corn] = ori;
	}
}	

function EdgeMult(a, b, prod) {
	for (var ed=0; ed<12; ed++) {
		prod.ep[ed] = a.ep[b.ep[ed]];
		prod.eo[ed] = (b.eo[ed] ^ a.eo[b.ep[ed]]);
	}
}

function CornConjugate(a, idx, b) {
	CornMult(CubeSym[SymInv[idx]], a, cctemp);
	CornMult(cctemp, CubeSym[idx], b);		
}

function EdgeConjugate(a, idx, b) {
	EdgeMult(CubeSym[SymInv[idx]], a, cctemp);
	EdgeMult(cctemp, CubeSym[idx], b);		
}

var CubeSym = Array(16);
var moveCube = Array(18);
var SymInv = Array(16);
var SymMult = Array(16);
var SymMove = Array(16);
var Sym8Mult = Array(8);
var Sym8Move = Array(8);
var Sym8MultInv = Array(8);
var SymMoveUD = Array(16);
var FlipS2R = Array(336);
var TwistS2R = Array(324);
var CPermS2R = Array(2768);
var EPermS2R = CPermS2R;
var FlipR2S = Array(2048);
var TwistR2S = Array(2187);
var EPermR2S = createArray(40320);
for (var i=0; i<40320; i++) {
	EPermR2S[i] = 0;
}
var MtoEPerm = Array(40320);
var merge = Array(56);
var e2c = [0, 0, 0, 0, 1, 3, 1, 3, 1, 3, 1, 3, 0, 0, 0, 0];
const urf1 = new CubieCube();
urf1.init(2531, 1373, 67026819, 1877);
const urf2 = new CubieCube();
urf2.init(2089, 1906, 322752913, 255);


function CubieInit() {
	var mc = Array(6);
	mc[0] = new CubieCube();
	mc[0].init(15120, 0, 119750400, 0);
	mc[1] = new CubieCube();
	mc[1].init(21021, 1494, 323403417, 0);
	mc[2] = new CubieCube();
	mc[2].init(8064, 1236, 29441808, 802);
	mc[3] = new CubieCube();
	mc[3].init(9, 0, 5880, 0);
	mc[4] = new CubieCube();
	mc[4].init(1230, 412, 2949660, 0);
	mc[5] = new CubieCube();
	mc[5].init(224, 137, 328552, 1160);
	for (var m=0; m<6; m++) {
		moveCube[m*3] = mc[m];
		for (var p=0; p<2; p++) {
			moveCube[m*3+p+1] = new CubieCube();
			EdgeMult(moveCube[m*3+p], mc[m], moveCube[m*3+p+1]);
			CornMult(moveCube[m*3+p], mc[m], moveCube[m*3+p+1]);
		}
	}
	var c = new CubieCube();
	var d = new CubieCube();
	var temp;
	var f2 = new CubieCube();
	f2.init(28783, 0, 259268407, 0);
	var u4 = new CubieCube();
	u4.init(15138, 0, 119765538, 1792);
	var lr2 = new CubieCube();
	lr2.init(5167, 0, 83473207, 0);
	lr2.co = [ 3, 3, 3, 3, 3, 3, 3, 3 ];
	for (var i=0; i<16; i++) {
		SymMult[i] = Array(16);
		SymMove[i] = Array(18);
		SymMoveUD[i] = Array(10);
		CubeSym[i] = new CubieCube();
		CubeSym[i].copy(c);
		CornMult(c, u4, d);
		EdgeMult(c, u4, d);
		temp = d;	d = c;	c = temp;
		if (i % 4 == 3) {
			CornMult(c, lr2, d);
			EdgeMult(c, lr2, d);
			temp = d;	d = c;	c = temp;				
		}
		if (i % 8 == 7) {
			CornMult(c, f2, d);
			EdgeMult(c, f2, d);
			temp = d;	d = c;	c = temp;
		}
	}

	for (var j=0; j<16; j++) {
		for (var k=0; k<16; k++) {
			CornMult(CubeSym[j], CubeSym[k], c);
			if (c.cp[0] == 0 && c.cp[1] == 1 && c.cp[2] == 2) {
				SymInv[j] = k;
				break;
			}
		}
	}
	for (var i=0; i<16; i++) {
		for (var j=0; j<16; j++) {
			CornMult(CubeSym[i], CubeSym[j], c);
			for (var k=0; k<16; k++) {
				if (CubeSym[k].cp[0] == c.cp[0] && CubeSym[k].cp[1] == c.cp[1] && CubeSym[k].cp[2] == c.cp[2]) {
					SymMult[i][j] = k;
					break;
				}
			}
		}
	}
	for (var j=0; j<18; j++) {
		for (var s=0; s<16; s++) {
			CornConjugate(moveCube[j], SymInv[s], c);
			for (var m=0; m<18; m++) {
				var found = 1;
				for (var i=0; i<8; i++) {
					if (c.cp[i] != moveCube[m].cp[i] || c.co[i] != moveCube[m].co[i]) {
						found = 0;
						break;
					}
				}
				if (found) {
					SymMove[s][j] = m;
				}
			}
		}
	}
	for (var j=0; j<10; j++) {
		for (var s=0; s<16; s++) {
			SymMoveUD[s][j] = std2ud[SymMove[s][ud2std[j]]];
		}
	}
	for (var j=0; j<8; j++) {
		Sym8Mult[j] = Array(8);
		Sym8Move[j] = Array(18);
		Sym8MultInv[j] = Array(8);
		for (var s=0; s<8; s++) {
			Sym8Mult[j][s] = (SymMult[j<<1][s<<1]>>>1);
		}
	}
	for (var j=0; j<18; j++) {
		for (var s=0; s<8; s++) {
			Sym8Move[s][j] = SymMove[s<<1][j];
		}
	}
	for (var j=0; j<8; j++) {
		for (var s=0; s<8; s++) {
			Sym8MultInv[j][s] = Sym8Mult[j][SymInv[s<<1]>>1];
		}
	}

	const occ = new Array(1260);

	var count = 0;
	for (var i=0; i<64; occ[i++] = 0);

	for (var i=0; i<2048; i++) {
		if ((occ[i>>>5]&(1<<(i&0x1f))) == 0) {
			c.setFlip(i);
			for (var s=0; s<16; s+=2) {
				EdgeConjugate(c, s, d);
				var idx = d.getFlip();
				occ[idx>>>5] |= 1<<(idx&0x1f);
				FlipR2S[idx] = ((count << 3) | (s >>> 1));
			}
			FlipS2R[count++] = i;
		}
	}
//	alert(count);
	count = 0;
	for (var i=0; i<69; occ[i++] = 0);
	for (var i=0; i<2187; i++) {
		if ((occ[i>>>5]&(1<<(i&0x1f))) == 0) {
			c.setTwist(i);
			for (var s=0; s<16; s+=2) {
				CornConjugate(c, s, d);
				var idx = d.getTwist();
				occ[idx>>>5] |= 1<<(idx&0x1f);
				TwistR2S[idx] =  ((count << 3) | (s >>> 1));
			}
			TwistS2R[count++] = i;
		}
	}
//	alert(count);

	var mask = Array(56);
	for (var i=0; i<56; i++) {
		mask[i] = Array(2);
		merge[i] = Array(56);
	}
	for (var i=0; i<40320; i++) {
		set8Perm(c.ep, i);
		var a = ~~(c.getURtoUL() / 6);
		var b = ~~(c.getDRtoDL() / 6);
		mask[a][b>>>5] |= 1 << (b&0x1f);
	}
	
	for (var i=0; i<56; i++) {
		count = 0;
		for (var j=0; j<56; j++) {
			if ((mask[i][j>>>5]&(1<<(j&0x1f))) != 0) {
				merge[i][j] = count++;
			}
		}
	}
	count = 0;
	for (var i=0; i<1260; occ[i++] = 0);
	for (var i=0; i<40320; i++) {
		if ((occ[i>>>5]&(1<<(i&0x1f))) == 0) {
			set8Perm(c.ep, i);
			for (var s=0; s<16; s++) {
				EdgeConjugate(c, s, d);
				var idx = get8Perm(d.ep);
				occ[idx>>>5] |= 1<<(idx&0x1f);
				var a = d.getURtoUL();
				var b = d.getDRtoDL();
				var m = (merge[~~(a/6)][~~(b/6)] * 4032 + a * 12 + b % 6 * 2 + get8Parity(idx));
				MtoEPerm[m] = (count << 4 | s);
				EPermR2S[idx] = (count << 4 | s);
			}
			EPermS2R[count++] = i;
		}
	}
}

var UDSliceMove = Array(495);//new char[495][18];
var TwistMove = Array(324);//new char[324][18];
var FlipMove = Array(336);//new char[336][18];
var UDSliceConj = Array(495);//new char[495][8];
var UDSliceTwistPrun = Array(495*324);//new byte[495 * 324];
var UDSliceFlipPrun = Array(495*336);//new byte[495 * 336];
	
var TwistFlipPrun = Array(336*324*8);//new byte[336 * 324 * 8];
	
	//phase1to2
var Mid3Move = Array(1320);//new char[1320][18];
var Mid32MPerm = Array(24);//new byte[24];
var CParity = Array(87);//new byte[2768/8];

	//phase2
var CPermMove = Array(2768);//new char[2768][18];
var EPermMove = Array(2768);//new char[2768][10];
var MPermMove = Array(24);//new byte[24][10];
var MPermConj = Array(24);//new byte[24][16];
var MCPermPrun = Array(24*2768);//new byte[24*2768];
var MEPermPrun = Array(24*2768);//new byte[24*2768];


function CoordInit() {
	var c = new CubieCube();
	var d = new CubieCube();
	var i, j;
	for (i=0; i<2768; i++) {
		CPermMove[i] = Array(18);
		set8Perm(c.cp, CPermS2R[i]);
		for (j=0; j<18; j++) {
			CornMult(c, moveCube[j], d);
			CPermMove[i][j] = d.getCPermSym();
		}
	}		
	for (i=0; i<2768; i++) {
		EPermMove[i] = Array(10);
		set8Perm(c.ep, EPermS2R[i]);
		for (j=0; j<10; j++) {
			EdgeMult(c, moveCube[ud2std[j]], d);
			EPermMove[i][j] = d.getEPermSym();
		}
	}
	for (i=0; i<336; i++) {
		FlipMove[i] = Array(18);
		c.setFlip(FlipS2R[i]);
		for (j=0; j<18; j++) {
			EdgeMult(c, moveCube[j], d);
			FlipMove[i][j] = d.getFlipSym();
		}
	}
	for (i=0; i<324; i++) {
		TwistMove[i] = Array(18);
		c.setTwist(TwistS2R[i]);
		for (j=0; j<18; j++) {
			CornMult(c, moveCube[j], d);
			TwistMove[i][j] = d.getTwistSym();
		}
	}
	for (i=0; i<495; i++) {
		UDSliceMove[i] = Array(18);
		c.setUDSlice(i);
		for (j=0; j<18; j++) {
			EdgeMult(c, moveCube[j], d);
			UDSliceMove[i][j] = d.getUDSlice();
		}
	}
	for (i=0; i<495; i++) {
		UDSliceConj[i] = Array(8);
		c.setUDSlice(i);
		for (j=0; j<16; j+=2) {
			EdgeConjugate(c, SymInv[j], d);
			UDSliceConj[i][j>>>1] = d.getUDSlice();
		}
	}
	for (i=0; i<1320; i++) {
		Mid3Move[i] = Array(18);
		c.setMid3(i);
		for (j=0; j<18; j++) {
			EdgeMult(c, moveCube[j], d);
			Mid3Move[i][j] = d.getMid3();
		}
	}	
	for (i=0; i<24; i++) {
		c.setMPerm(i);
		Mid32MPerm[c.getMid3() % 24] = i;
	}
	for (i=0; i<2768; i++) {
		CParity[i>>>3] |= (get8Parity(CPermS2R[i])) << (i & 7);
	}
	for (i=0; i<24; i++) {
		MPermMove[i] = Array(10);
		c.setMPerm(i);
		for (j=0; j<10; j++) {
			EdgeMult(c, moveCube[ud2std[j]], d);
			MPermMove[i][j] = d.getMPerm();
		}
	}		
	for (i=0; i<24; i++) {
		MPermConj[i] = Array(16);
		c.setMPerm(i);
		for (j=0; j<16; j++) {
			EdgeConjugate(c, SymInv[j], d);
			MPermConj[i][j] = d.getMPerm();
		}
	}
	
	var SymState = Array(324);
	for (i=0; i<324; i++) {
		c.setTwist(TwistS2R[i]);
		for (var j=0; j<8; j++) {
			CornConjugate(c, j<<1, d);
			if (binarySearch(TwistS2R, d.getTwist()) != 0xffff) {
				SymState[i] |= (1 << j);
			}
		}
	}
	var SymStateF = Array(324);
	for (i=0; i<336; i++) {
		c.setFlip(FlipS2R[i]);
		for (var j=0; j<8; j++) {
			EdgeConjugate(c, j<<1, d);
			if (binarySearch(FlipS2R, d.getFlip()) != 0xffff) {
				SymStateF[i] |= (1 << j);
			}
		}
	}		
	for (i=0; i<336*324*8; i++) {
		TwistFlipPrun[i] = -1;
	}
	for (i=0; i<8; i++) {
		TwistFlipPrun[i] = 0;
	}
	var depth = 0;
	var done = 8;
	var inv;
	var select;
	var check;
	
	while (done < 336*324*8) {
		inv = depth > 6;
		select = inv ? -1 : depth;
		check = inv ? depth : -1;
		depth++;
		for (i=0; i<336*324*8; i++) {
			if (TwistFlipPrun[i] != select)
				continue;
			var twist = ~~(i / 2688);
			var flip = i % 2688;
			var fsym = i & 7;
			flip >>>= 3;
			for (var m=0; m<18; m++) {
				var twistx = TwistMove[twist][m];
				var tsymx = twistx & 7;
				twistx >>>= 3;
				var flipx = FlipMove[flip][Sym8Move[fsym][m]];
				var fsymx = Sym8MultInv[Sym8Mult[flipx & 7][fsym]][tsymx];
				flipx >>>= 3;
				var idx = twistx * 2688 + (flipx << 3 | fsymx);
				if (TwistFlipPrun[idx] == check) {
					done++;
					if (inv) {
						TwistFlipPrun[i] = depth;
						break;
					} else {
						TwistFlipPrun[idx] = depth;
						var sym = SymState[twistx];
						var symF = SymStateF[flipx];
						if (sym != 1 || symF != 1) {
							for (var j=0; j<8; j++, symF >>= 1) {
								if ((symF & 1) == 1) {
									var fsymxx = Sym8MultInv[fsymx][j];
									for (var k=0; k<8; k++) {
										if ((sym & (1 << k)) != 0) {
											var idxx = twistx * 2688 + (flipx << 3 | Sym8MultInv[fsymxx][k]);
											if (TwistFlipPrun[idxx] == -1) {
												TwistFlipPrun[idxx] = depth;
												done++;
											}
										}
									}
								}
							}
						}
					}
				}
			}
		}
//			System.out.println(String.format("%2d%10d", depth, done));
	}
	for (i=0; i<495*324; i++) {
		UDSliceTwistPrun[i] = -1;
	}
	UDSliceTwistPrun[0] = 0;
	depth = 0;
	done = 1;
	while (done < 495 * 324) {
		inv = depth > 6;
		select = inv ? -1 : depth;
		check = inv ? depth : -1;
		depth++;
		for (i=0; i<495*324; i++) {
			if (UDSliceTwistPrun[i] == select) {
				var slice = i % 495;
				var twist = ~~(i / 495);
				for (var m=0; m<18; m++) {
					var twistx = TwistMove[twist][m];
					var symx = twistx & 7;
					var slicex = UDSliceConj[UDSliceMove[slice][m]][symx];
					twistx >>>= 3;
					var idx = twistx * 495 + slicex;
					if (UDSliceTwistPrun[idx] == check) {
						done++;
						if (inv) {
							UDSliceTwistPrun[i] = depth;
							break;
						} else {
							UDSliceTwistPrun[idx] = depth;
							var sym = SymState[twistx];
							if (sym != 1) {
								for (var j=1; j<8; j++) {
									sym >>= 1;
									if ((sym & 1) == 1) {
										var idxx = twistx * 495 + UDSliceConj[slicex][j];
										if (UDSliceTwistPrun[idxx] == -1) {
											UDSliceTwistPrun[idxx] = depth;
											done++;
										}
									}
								}
							}
						}
					}
				}
			}
		}
//			System.out.println(String.format("%2d%10d", depth, done));
	}		

	for (i=0; i<495*336; i++) {
		UDSliceFlipPrun[i] = -1;
	}
	UDSliceFlipPrun[0] = 0;
	depth = 0;
	done = 1;
	while (done < 495 * 336) {
		inv = depth > 6;
		select = inv ? -1 : depth;
		check = inv ? depth : -1;
		depth++;
		for (i=0; i<495*336; i++) {
			if (UDSliceFlipPrun[i] == select) {
				var slice = i % 495;
				var flip = ~~(i / 495);
				for (var m=0; m<18; m++) {
					var flipx = FlipMove[flip][m];
					var symx = flipx & 7;
					var slicex = UDSliceConj[UDSliceMove[slice][m]][symx];
					flipx >>>= 3;
					var idx = flipx * 495 + slicex;
					if (UDSliceFlipPrun[idx] == check) {
						done++;
						if (inv) {
							UDSliceFlipPrun[i] = depth;
							break;
						} else {
							UDSliceFlipPrun[idx] = depth;
							var sym = SymStateF[flipx];
							if (sym != 1) {
								for (var j=1; j<8; j++) {
									sym >>= 1;
									if ((sym & 1) == 1) {
										var idxx = flipx * 495 + UDSliceConj[slicex][j];
										if (UDSliceFlipPrun[idxx] == -1) {
											UDSliceFlipPrun[idxx] = depth;
											done++;
										}
									}
								}
							}
						}
					}
				}
			}
		}
//			depth++;
//			System.out.println(String.format("%2d%10d", depth, done));
	}	
	
	SymState = Array(2768);
	for (i=0; i<2768; i++) {
		set8Perm(c.ep, EPermS2R[i]);
		for (j=1; j<16; j++) {
			EdgeConjugate(c, j, d);
			if (binarySearch(EPermS2R, get8Perm(d.ep)) != 0xffff) {
				SymState[i] |= (1 << j);
			}
		}
	}
	for (i=0; i<24*2768; i++) {
		MEPermPrun[i] = -1;
	}
	MEPermPrun[0] = 0;
	while (done < 24*2768) {
		inv = depth > 7;
		select = inv ? -1 : depth;
		check = inv ? depth : -1;
		depth++;
		for (i=0; i<24*2768; i++) {
			if (MEPermPrun[i] == select) {
				var mid = i % 24;
				var edge = ~~(i / 24);
				for (var m=0; m<10; m++) {
					var edgex = EPermMove[edge][m];
					var symx = edgex & 15;
					var midx = MPermConj[MPermMove[mid][m]][symx];
					edgex >>>= 4;
					var idx = edgex * 24 + midx;
					if (MEPermPrun[idx] == check) {
						done++;
						if (inv) {
							MEPermPrun[i] = depth;
							break;
						} else {
							MEPermPrun[idx] = depth;
							var sym = SymState[edgex];
							if (sym != 0) {
								for (j=1; j<16; j++) {
									sym >>= 1;
									if ((sym & 1) == 1) {
										var idxx = edgex * 24 + MPermConj[midx][j];
										if (MEPermPrun[idxx] == -1) {
											MEPermPrun[idxx] = depth;
											done++;
										}
									}
								}
							}
						}
					}
				}
			}
		}
//			System.out.println(String.format("%2d%10d", depth, done));
	}		
		
	for (i=0; i<24*2768; i++) {
		MCPermPrun[i] = -1;
	}
	MCPermPrun[0] = 0;
	depth = 0;
	done = 1;
	while (done < 24*2768) {
		inv = depth > 7;
		select = inv ? -1 : depth;
		check = inv ? depth : -1;
		depth++;
		for (i=0; i<24*2768; i++) {
			if (MCPermPrun[i] == select) {
				var mid = i % 24;
				var corn = ~~(i / 24);
				for (var m=0; m<10; m++) {
					var cornx = CPermMove[corn][ud2std[m]];
					var symx = (cornx & 15);
					var midx = MPermConj[MPermMove[mid][m]][symx];
					cornx >>>= 4;
					var idx = cornx * 24 + midx;
					if (MCPermPrun[idx] == check) {
						done++;
						if (inv) {
							MCPermPrun[i] = depth;
							break;
						} else {
							MCPermPrun[idx] = depth;
							var sym = SymState[cornx];
							if (sym != 0) {
								for (j=1; j<16; j++) {
									sym >>= 1;
									if ((sym & 1) == 1) {
										var idxx = cornx * 24 + MPermConj[midx][j ^ e2c[j]];
										if (MCPermPrun[idxx] == -1) {
											MCPermPrun[idxx] = depth;
											done++;
										}
									}
								}
							}
						}
					}
				}
			}
		}
//			System.out.println(String.format("%2d%10d", depth, done));
	}
}					

function randomCube() {
	var eperm;
	var cperm;
	do {
		eperm = ~~(Math.random() * 479001600);
		cperm = ~~(Math.random() * 40320);
	} while (((get8Parity(cperm) ^ get12Parity(eperm))) != 0);
	var c = new CubieCube();
	c.init(cperm, ~~(Math.random() * 2187), eperm, ~~(Math.random() * 2048));
	return c;
}

var move = Array(31);

var corn = Array(20);
var csym = Array(20);
var mid3 = Array(20);
var e1 = Array(20);
var e2 = Array(20);
var urfidx;

var twist = Array(6);
var tsym = Array(6);
var flip = Array(6);
var fsym = Array(6);
var slice = Array(6);
var corn0 = Array(6);
var csym0 = Array(6);
var mid30 = Array(6);
var e10 = Array(6);
var e20 = Array(6);
var prun = Array(6);

var length1 = 0;
var maxlength2 = 0;
var sol = 999;
var valid1 = 0;
var valid2 = 0;
var solution = "";
var useSeparator = false;

function Solve(c) {
	c.temps = new CubieCube();
	for (var i=0; i<6; i++) {
		twist[i] = c.getTwistSym();
		tsym[i] = twist[i] & 7;
		twist[i] >>>= 3;
		flip[i] = c.getFlipSym();
		fsym[i] = flip[i] & 7;
		flip[i] >>>= 3;
		slice[i] = c.getUDSlice();
		corn0[i] = c.getCPermSym();
		csym0[i] = corn0[i] & 15;
		corn0[i] >>>= 4;
		mid30[i] = c.getMid3();
		e10[i] = c.getURtoUL();
		e20[i] = c.getDRtoDL();
		prun[i] = Math.max(Math.max(UDSliceTwistPrun[twist[i] * 495 + UDSliceConj[slice[i]][tsym[i]]],
						UDSliceFlipPrun[flip[i] * 495 + UDSliceConj[slice[i]][fsym[i]]]),
						TwistFlipPrun[twist[i] * 2688 + (flip[i] << 3 | Sym8MultInv[fsym[i]][tsym[i]])]);
		c.URFConjugate();
		if (i==2) {
			c.invCubieCube();
		}
	}
	solution = null;
	sol = 22;
	for (length1=0; length1<sol; length1++) {
		maxlength2 = Math.min(sol/2+1, sol-length1);
		for (urfidx=0; urfidx<6; urfidx++) {
			corn[0] = corn0[urfidx];
			csym[0] = csym0[urfidx];
			mid3[0] = mid30[urfidx];
			e1[0] = e10[urfidx];
			e2[0] = e20[urfidx];
			if ((prun[urfidx] <= length1)
					&& phase1(twist[urfidx], tsym[urfidx], flip[urfidx], fsym[urfidx],
								slice[urfidx], length1, 18)) {
				if (solution == null) {
					return "Error 8";
				} else {
					return solution;
				}
			}
		}
	}
	return "Error 7";
}

function phase1(twist, tsym, flip, fsym, slice, maxl, lm) {
	if (twist==0 && flip==0 && slice==0 && maxl < 5) {
		return maxl == 0 && init2();
	}
	for (var m=0; m<18; m++) {
		if (ckmv[lm][m]) {
			m+=2;
			continue;
		}
		var slicex = UDSliceMove[slice][m];
		var twistx = TwistMove[twist][Sym8Move[tsym][m]];
		var tsymx = Sym8Mult[twistx & 7][tsym];
		twistx >>>= 3;
		if (UDSliceTwistPrun[twistx * 495 + UDSliceConj[slicex][tsymx]] >= maxl) {
			continue;
		}
		var flipx = FlipMove[flip][Sym8Move[fsym][m]];
		var fsymx = Sym8Mult[flipx & 7][fsym];
		flipx >>>= 3;
		if (TwistFlipPrun[twistx * 2688 + (flipx << 3 | Sym8MultInv[fsymx][tsymx])] >= maxl
				||UDSliceFlipPrun[flipx * 495 + UDSliceConj[slicex][fsymx]] >= maxl) {
			continue;
		}
		move[length1-maxl] = m;
		valid1 = Math.min(valid1, length1-maxl);
		if (phase1(twistx, tsymx, flipx, fsymx, slicex, maxl-1, m)) {
			return true;
		}
	}
	return false;
}

function init2() {
//	if (System.currentTimeMillis() > timeOut) {
//		return true;
//	}
	valid2 = Math.min(valid2, valid1);
	for (var i=valid1; i<length1; i++) {
		var m = move[i];
		corn[i+1] = CPermMove[corn[i]][SymMove[csym[i]][m]];
		csym[i+1] = SymMult[corn[i+1] & 15][csym[i]];
		corn[i+1] >>>= 4;
		mid3[i+1] = Mid3Move[mid3[i]][m];
	}
	valid1 = length1;
	var mid = Mid32MPerm[mid3[length1] % 24];
	var prun = MCPermPrun[corn[length1] * 24 + MPermConj[mid][csym[length1]]];
	if (prun >= maxlength2) {
		return false;
	}
	for (var i=valid2; i<length1; i++) {
		e1[i+1] = Mid3Move[e1[i]][move[i]];
		e2[i+1] = Mid3Move[e2[i]][move[i]];
	}
	valid2 = length1;
	var cornx = corn[length1];
	var ex = merge[~~(e1[length1]/6)][~~(e2[length1]/6)] * 4032
				 + e1[length1] * 12 + e2[length1] % 6 * 2 + (((CParity[cornx>>>3]>>>(cornx&7))&1) ^ get4Parity(mid));
	var edge = MtoEPerm[ex];
	var esym = edge & 15;
	edge >>>= 4;
		prun = Math.max(MEPermPrun[edge * 24 + MPermConj[mid][esym]], prun);
	if (prun >= maxlength2) {
		return false;
	}
		var lm = length1==0 ? 10 : std2ud[~~(move[length1-1]/3)*3+1];
	for (var i=prun; i<maxlength2; i++) {
		if (phase2(edge, esym, corn[length1], csym[length1], mid, i, length1, lm)) {
			sol = length1 + i;
			var sb = "";
			var urf = urfidx;
//			if (inverse) {
				urf = (urf + 3) % 6;
//			}
			if (urf < 3) {
				for (var s=0; s<length1; s++) {
					sb += move2str[urfMove[urf][move[s]]] + ' ';
				}
				for (var s=length1; s<sol; s++) {
					sb += move2str[urfMove[urf][move[s]]] + ' ';
				}
			} else {
				for (var s=sol-1; s>=length1; s--) {
					sb += move2str[urfMove[urf][move[s]]] + ' ';
				}
				for (var s=length1-1; s>=0; s--) {
					sb += move2str[urfMove[urf][move[s]]] + ' ';
				}
			}
			// sb += "(" + sol + "f)";
			solution = sb;
			return true;
		}
	}
	return false;
}

function phase2(edge, esym, corn, csym, mid, maxl, depth, lm) {
	if (edge==0 && corn==0 && mid==0) {
		return true;
	}
	for (var m=0; m<10; m++) {
		if (ckmv2[lm][m]) {
			continue;
		}
		var midx = MPermMove[mid][m];
		var edgex = EPermMove[edge][SymMoveUD[esym][m]];
		var esymx = SymMult[edgex & 15][esym];
		edgex >>>= 4;
		if (MEPermPrun[edgex * 24 + MPermConj[midx][esymx]] >= maxl) {
			continue;
		}
		var cornx = CPermMove[corn][SymMove[csym][ud2std[m]]];
		var csymx = SymMult[cornx & 15][csym];
		cornx >>>= 4;
		if (MCPermPrun[cornx * 24 + MPermConj[midx][csymx]] >= maxl) {
			continue;
		}
		move[depth] = ud2std[m];
		if (phase2(edgex, esymx, cornx, csymx, midx, maxl-1, depth+1, m)) {
			return true;
		}
	}
	return false;
}

var initialized = false;

function initialize() {
	if (initialized) {
		return;
	}
	CubieInit();
	CoordInit();
	initialized = true;
}

function solve(c) {
	initialize();
	const cc = new CubieCube();
	cc.cp = c.cp;
	cc.co = c.co;
	cc.ep = c.ep;
	cc.eo = c.eo;
	return Solve(cc);
};

module.exports.initialize = initialize;
module.exports.solve = solve;
module.exports.randomCube = randomCube;
