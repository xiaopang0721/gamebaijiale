/**
* name 
*/
module gamebaijiale.data {
	export class BaijialeData extends gamecomponent.object.PlayingPuKeCard {
		public _isFan: boolean = false;
		private _b: boolean;
		//牌X轴位置，牌Y轴位置
		private _posList: any = [[505, 300, 80], [775, 300, -80], [515, 225, 0], [765, 225, 0]];
		//牌倾斜角度
		private _skewList: any = [[Math.PI / 36, 0], [-Math.PI / 36, 0], [0, -Math.PI / 36], [0, Math.PI / 36]];
		private _curIdx: number;
		private _size: number = 0.6;//牌尺寸
		private _card_count: number;//实际牌值

		constructor() {
			super();
		}

		public Init(v: number) {
			//8副牌
			if (v < 0 || v > 52 * 8) {
				throw "PlayingCard v < 0 || v > 52 * 8," + v
			}
			this._val = v - 1;
			this.Analyze();
			this.time_interval = 400;
		}

		protected Analyze(): void {
			let val = this._val % 52;
			this._card_val = val % 13 + 1;
			this._card_color = Math.floor(val / 13);
			if (this._card_val >= 10)
				this._card_count = 0;
			else
				this._card_count = this._card_val;
			this._isFan = this._val < 0 ? false : true;
		}

		//获取实际牌值
		public GetCardCount() {
			return this._card_count;
		}

		myOwner(index: number) {
			this.size = 0.2;
			this._curIdx = index;
			this.rotateAngle = Math.PI / 6;
		}

		fapai() {
			let posX = this._posList[this._curIdx][0];
			let posY = this._posList[this._curIdx][1];
			let space = this._posList[this._curIdx][2];
			// let skewX = this._skewList[this._curIdx][0];
			// let skewY = this._skewList[this._curIdx][1];
			if (this.index == 2) {
				posX = this._posList[this._curIdx + 2][0];
				posY = this._posList[this._curIdx + 2][1];
				space = this._posList[this._curIdx + 2][2];
				// skewX = this._skewList[this._curIdx + 2][0];
				// skewY = this._skewList[this._curIdx + 2][1];
			}
			if (!this.targe_pos) {
				this.targe_pos = new Vector2();
			}
			this.targe_pos.x = posX + this.index * space;
			this.targe_pos.y = posY;
			// this.skew_x = skewX;
			// this.skew_y = skewY;
			this.scaleX = -1;
			super.fapai();
			Laya.Tween.clearAll(this);
			Laya.Tween.to(this, { size: this._size }, this.time_interval);
			Laya.Tween.to(this, { rotateAngle: Math.PI * 4 }, this.time_interval);
		}

		refapai() {
			let posX = this._posList[this._curIdx][0];
			let posY = this._posList[this._curIdx][1];
			let space = this._posList[this._curIdx][2];
			if (!this.targe_pos) {
				this.targe_pos = new Vector2();
			}
			this.pos.x = posX + this.index * space;
			this.pos.y = posY;
			this.targe_pos.x = posX + this.index * space;
			this.targe_pos.y = posY;
			this.size = this._size;
			this.rotateAngle = Math.PI * 4;
			super.refapai();
		}

		bupai() {
			let posX = this._posList[this._curIdx + 2][0];
			let posY = this._posList[this._curIdx + 2][1];
			let space = this._posList[this._curIdx + 2][2];
			if (!this.targe_pos) {
				this.targe_pos = new Vector2();
			}
			this.targe_pos.x = posX + this.index * space;
			this.targe_pos.y = posY;
			this.scaleX = -1;
			super.fapai();
			Laya.Tween.clearAll(this);
			Laya.Tween.to(this, { size: this._size }, this.time_interval);
			Laya.Tween.to(this, { rotateAngle: Math.PI * 4.5 }, this.time_interval);
		}

		rebupai() {
			let posX = this._posList[this._curIdx + 2][0];
			let posY = this._posList[this._curIdx + 2][1];
			let space = this._posList[this._curIdx + 2][2];
			if (!this.targe_pos) {
				this.targe_pos = new Vector2();
			}
			this.pos.x = posX + this.index * space;
			this.pos.y = posY;
			this.targe_pos.x = posX + this.index * space;
			this.targe_pos.y = posY;
			this.scaleX = 1;
			this.isShow = true;
			this.size = this._size;
			this.rotateAngle = Math.PI * 4.5;
			super.fapai();
		}

		fanpai() {
			if (!this._isFan) return;
			super.fanpai();
		}

		kaipai() {
			if (!this._isFan) return;
			this.visible = true;
			this.scaleX = 1;
			this.isShow = true;
			// super.fanpai();
		}
	}
}