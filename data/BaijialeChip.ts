/**
* name 
*/
module gamebaijiale.data {
	export class BaijialeChip extends gamecomponent.object.PlayingChip {
		constructor() {
			super();
		}
		//筹码起始位置(主玩家，其他玩家，庄家，座位0，座位1，座位2，座位3，座位4，座位5)  
		private _chipStart = [[190, 610], [70, 657], [635, 95],
		[85, 215], [85, 345], [85, 500], [1225, 180], [1225, 345], [1225, 500]];
		private _chipEnd = [[320, 260], [955, 260], [645, 420], [180, 420], [355, 420], [1095, 420], [925, 420]];  //筹码终点位置
		private _startIndex: number;
		private _targetIndex: number;
		private _radiusX: number;//圆形区域X半径
		private _radiusY: number;//圆形区域Y半径
		public _seatIndex: number;//精灵座位归属
		//初始位置，终点位置，筹码类型，筹码大小，筹码层级
		setData(startIdx: number, targetIdx: number, type: number, value: number, index: number, unitIndex: number) {
			this.size = 0.4;
			this.sortScore = -index;
			this.pos = new Vector2(this._chipStart[startIdx][0], this._chipStart[startIdx][1]);
			this._val = value.toString();
			this._type = type;
			this._startIndex = startIdx;
			this._targetIndex = targetIdx - 1;
			// this.rotateAngle = MathU.randomRange(0, 360);
			this._seatIndex = unitIndex;
			this._radiusX = targetIdx <= 2 ? 85 : targetIdx == 3 ? 100 : 40;
			this._radiusY = targetIdx <= 2 ? 35 : targetIdx == 3 ? 22 : 22;
		}

		sendChip() {
			let posX = MathU.randomPointInCicle(new Vector2(this._chipEnd[this._targetIndex][0], this._chipEnd[this._targetIndex][1]), 0, this._radiusX).x;
			let posY = MathU.randomPointInCicle(new Vector2(this._chipEnd[this._targetIndex][0], this._chipEnd[this._targetIndex][1]), 0, this._radiusY).y;
			if (!this.targe_pos) {
				this.targe_pos = new Vector2();
			}
			this.targe_pos.x = posX;
			this.targe_pos.y = posY;
			super.sendChip();
		}

		flyChip(index: number, isBanker: boolean, count: number, game: Game) {
			if (!this.targe_pos) {
				this.targe_pos = new Vector2();
			}
			this.isFinalPos = false;
			let target = isBanker ? this._chipEnd : this._chipStart;
			this.targe_pos.x = target[index][0];
			this.targe_pos.y = target[index][1];
			if (!this.pos) return;
			super.flyChipBase(500 + count * 8,game);
		}

		drawChip() {
			let posX = MathU.randomPointInCicle(new Vector2(this._chipEnd[this._targetIndex][0], this._chipEnd[this._targetIndex][1]), 0, this._radiusX).x;
			let posY = MathU.randomPointInCicle(new Vector2(this._chipEnd[this._targetIndex][0], this._chipEnd[this._targetIndex][1]), 0, this._radiusY).y;
			if (!this.targe_pos) {
				this.targe_pos = new Vector2();
			}
			this.pos.x = posX;
			this.pos.y = posY;
			this.targe_pos.x = posX;
			this.targe_pos.y = posY;
		}
	}
}