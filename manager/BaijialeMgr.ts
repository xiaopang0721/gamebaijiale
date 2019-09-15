/**
* name 
*/
module gamebaijiale.manager {
	export class BaijialeMgr extends gamecomponent.managers.PlayingCardMgrBase<BaijialeData>{
		static readonly MAPINFO_OFFLINE: string = "BaijialeMgr.MAPINFO_OFFLINE";//假精灵
		static readonly DEAL_OVER: string = "BaijialeMgr.DEAL_OVER";//发牌结束
		static readonly SHOW_OVER: string = "BaijialeMgr.SHOW_OVER";//开牌结束

		private _winnerIndex: number;//赢家位置
		private _offlineUnit: UnitOffline;//假精灵信息
		private _isCancel: boolean = false;
		private _isReConnect: boolean = true;
		private _cardsTemp: any = [];	//牌数据

		constructor(game: Game) {
			super(game)
		}

		get offlineUnit() {
			return this._offlineUnit;
		}

		set offlineUnit(v) {
			this._offlineUnit = v;
			this.event(BaijialeMgr.MAPINFO_OFFLINE)
		}

		get isCancel() {
			return this._isCancel;
		}

		set isCancel(v) {
			this._isCancel = v;
			this.event(BaijialeMgr.MAPINFO_OFFLINE)
		}

		get isReConnect() {
			return this._isReConnect;
		}

		set isReConnect(v) {
			this._isReConnect = v;
		}

		get allCards() {
			return this._cards;
		}

		//对牌进行排序 重写不需要排序
		SortCards(cards: any[]) {

		}

		sort() {
			let count = 0;
			let cardIndex = 0;
			for (let index = 0; index < this._cardsTemp.length; index++) {
				for (let i = 0; i < this._cardsTemp[index].length; i++) {
					let card = this._cards[cardIndex] as BaijialeData;
					card.Init(this._cardsTemp[index][i]);
					card.myOwner(index);
					card.index = i;
					card.sortScore = -i;
					cardIndex++;
				}
			}
		}

		initCards(all_val: Array<number>) {
			let card_arr = [];
			if (!all_val) return;
			for (let i: number = 0; i < all_val.length; i++) {
				let card: BaijialeData;
				card = new BaijialeData();
				card.Init(all_val[i]);
				card_arr.push(card);
			}
			return card_arr;
		}

		//补牌
		addCard(val: number, create_fun: Handler, ownerIdx: number, cardIdx: number, isReAdd: boolean): void {
			let card: BaijialeData;
			card = create_fun.run();
			this._cards.push(card)
			card.Init(val);
			card.index = cardIdx;
			card.sortScore = -cardIdx;
			card.myOwner(ownerIdx - 1)
			if (isReAdd)//重连
				card.rebupai();
			else {
				Laya.timer.once(350, this, () => {
					card.bupai();
				})
			}
		}

		setValue(_cards, index) {
			if (!this._cards.length) return;
			if (!_cards) return;
			for (let i = 0; i < 2; i++) {
				let card = this._cards[index * 2 + i] as BaijialeData;
				if (card) {
					card.Init(_cards[i]);
					card.index = i;
					card.sortScore = -i;
					card.fanpai();
				}
			}
		}

		setOneValue(_cards, index, i) {
			if (!this._cards.length) return;
			if (!_cards) return;
			let card = this._cards[index * 2 + i] as BaijialeData;
			if (card) {
				card.Init(_cards[i]);
				card.index = i;
				card.sortScore = -i;
				if (i == 1)
					card.kaipai();
				else
					card.fanpai();
			}
		}

		kaipai(i) {
			if (!this._cards.length) return;
			let card = this._cards[4 + i] as BaijialeData;
			if (card) card.kaipai();
		}

		compare() {

		}

		//发牌
		fapai() {
			let count = 0;
			// let counter = 0;
			for (let index = 0; index < 2; index++) {
				for (let i = 0; i < this._cardsTemp.length; i++) {
					let card = this._cards[index + i * 2];
					//播音效
					Laya.timer.once(120 * count, this, () => {
						this._game.playSound(PathGameTongyong.music_tongyong + "fapai.mp3", false);
						if (!card) return;
						card.fapai();
						// counter++;
						// if (counter >= this._cards.length) {
						// 	this.event(BaijialeMgr.DEAL_OVER);
						// }
					});
					count++;
				}
			}
		}

		//重新发牌（正常）
		refapai() {
			for (let i: number = 0; i < this._cards.length; i++) {
				let card = this._cards[i];
				if (!card) return;
				card.refapai();
			}
		}

		//发牌了
		isDealCard(): void {
			this._cardsTemp = [[0, 0], [0, 0]];
		}

		//重置数据
		resetData(): void {
			this._cardsTemp = [];
		}

		//播放搓牌动画隐藏场景牌
		yincang(index: number, type: number): void {
			let card: BaijialeData;
			if (!type)//发牌
				card = this._cards[2 * index + 1];
			else//补牌
				card = this._cards[4 + index];
			if (!card) return;
			card.visible = false;
		}

		//分析两副牌，判断是否补牌
		analyzeCards(): number {
			if (!this._cards.length) return;
			let xianCount = 0;
			let zhuangCount = 0;
			let type = 0;//不补牌为0
			xianCount = this._cards[0].GetCardCount() + this._cards[1].GetCardCount();
			zhuangCount = this._cards[2].GetCardCount() + this._cards[3].GetCardCount();
			if (xianCount >= 8 || zhuangCount >= 8) { //庄闲任意一家拿到8点或9点,双方均不补牌
				return type;
			}
			if (xianCount >= 6 && xianCount <= 7 && zhuangCount >= 6 && zhuangCount && 7) { //庄闲双方均拿到6点或者7点，则不再补牌
				return type;
			}
			if (xianCount <= 5) {
				type = 1;//第一副牌补牌为1
			}
			if (zhuangCount < 3) {
				type = 2;//第二副牌补牌为2
			} else if (zhuangCount == 3) {
				if (this._cards[4]) {
					if (this._cards[4].GetCardCount() != 8) {
						type = 2;//第二副牌补牌为2
					}
				} else {
					type = 2;//第二副牌补牌为2
				}
			} else if (zhuangCount == 4) {
				if (this._cards[4]) {
					let count = this._cards[4].GetCardCount();
					if (!(count == 0 || count == 1 || count == 8 || count == 9)) {
						type = 2;//第二副牌补牌为2
					}
				} else {
					type = 2;//第二副牌补牌为2
				}
			} else if (zhuangCount == 5) {
				if (this._cards[4]) {
					let count = this._cards[4].GetCardCount();
					if (count >= 4 && count <= 7) {
						type = 2;//第二副牌补牌为2
					}
				} else {
					type = 2;//第二副牌补牌为2
				}
			} else if (zhuangCount == 6) {
				if (this._cards[4]) {
					let count = this._cards[4].GetCardCount();
					if (count == 6 || count == 7) {
						type = 2;//第二副牌补牌为2
					}
				}
			}
			return type;
		}
	}
}