// 样式.
const el_css = `width: 300px;height: 225px;margin: 0 auto;position: relative;box-sizing: border-box;overflow: hidden;`;

import "./verification.css"

class verificationCode {
  constructor(el, params) {
    this.getUrl = params.getUrl
    this.postUrl = params.postUrl
    this.el = document.getElementById(el); // 根节点
    this.Api = params.api; // 请求
    this.el.style = el_css;
    this.temp = {};
    // 单位换算- 验证码的坐标信息 1125 * 702, 展示固定大小 300 * 187
    this.unitSize = 1125 / 300;
    // 验证码背景大小  11
    this.drag = {
      x: 0, // X轴坐标.
      y: 0, // Y轴坐标.
      id: '', // 验证码ID
    };
    // 校验通过返回id
    this.verification_id = '';
    this.innerHTMLElement();
  }
  // 初始化Dom节点
  innerHTMLElement() {
    const temp = `
      <div class="code-background"></div>
      <div class="code-screenshot"></div>
      <div class="code-drag">
        <div class="code-left"></div>
        <input type="range" class="code-range" value="0">
        <div class="code-again">重试</div>
      </div>
    `;
    this.el.innerHTML = temp;
    // 节点获取.
    this.temp = {
      box: document.querySelector('.code-background'), // 背景图
      gap: document.querySelector('.code-screenshot'), // 验证图
      left: document.querySelector('.code-left'), // 左侧拖动进度条
      ipt: document.querySelector('.code-range'), // input range
      btn: document.querySelector('.code-again'), // 重试按钮
    };
    const { box, gap, left, ipt, btn } = this.temp;
    // 获取容器的宽度.
    this.boxWidth = parseInt(window.getComputedStyle(box, null)['width']);
    //获取滑块的宽度.
    this.gapWidth = parseInt(window.getComputedStyle(gap, null)['width']);

    // 绑定重定按钮
    btn.addEventListener('click', () => {
      if (this.verification_id) return;
      this.verification_id = '';
      ipt.value = 0;
      ipt.disabled = false;
      btn.style.display = 'none';
      gap.style.left = '0px';
      left.style.width = '0px';
      btn.style.width = '0px';
      btn.innerHTML = '重试';
      btn.style.background = '';
      this.getCaptureInfo();
    });
    // 图片位置实时移动
    ipt.addEventListener('input', () => {
      const width = ((this.boxWidth - this.gapWidth) * ipt.value) / 100;
      gap.style.left = width + 'px';
      left.style.width = width + 54 + 'px';
      btn.style.width = 300 - (width + 54) + 'px';
    });
    // 图片拖动结束.
    ipt.addEventListener('change', () => {
      ipt.disabled = true;
      btn.style.display = 'block';
      // 获取截图当前坐标
      var gap_ps = this.getElementPagePosition(gap);
      // 获取背景图坐标
      var box_ps = this.getElementPagePosition(box);
      // 获取当前坐标x
      this.drag.x = gap_ps.x - box_ps.x;
      console.log('当前坐标ps:', gap_ps, box_ps);
      // 请求验证码
      this.sumbitReq();
    });

    // 获取验证码信息
    this.getCaptureInfo();
  }
  // 触发请求.
  sumbitReq() {
    var params = Object.assign(
      {},
      {
        ...this.drag,
        x: this.drag.x * this.unitSize,
      }
    );
    this.Api.post(this.postUrl, params).then((response) => {
      // 请求成功
      const { status, result } = response.data;
      if (status == 'success') {
        this.verification_id = result.code;
        this.temp.btn.innerHTML = '成功';
      } else {
        alert(JSON.stringify(result));
      }
    });
  }

  // 获取验证码信息
  getCaptureInfo() {
    this.Api.get(this.getUrl).then((response) => {
      const { status, result } = response.data;
      if (status == 'success') {
        this.drag.id = result.id; // 验证码
        this.drag.y = result.y; //纵向坐标周
        this.temp.box.style.backgroundImage = 'url(' + result.bg + ')';
        this.temp.gap.style.backgroundImage = 'url(' + result.dg + ')';
        this.temp.gap.style.top = Math.floor(result.y / this.unitSize) + 'px';
      } else {
        alert('请求验证码失败～');
      }
    });
  }

  // 获取坐标
  getElementPagePosition(element) {
    //计算x坐标
    var actualLeft = element.offsetLeft;
    var current = element.offsetParent;
    while (current !== null) {
      actualLeft += current.offsetLeft;
      current = current.offsetParent;
    }
    //计算y坐标
    var actualTop = element.offsetTop;
    var currentY = element.offsetParent;
    while (currentY !== null) {
      actualTop += currentY.offsetTop + currentY.clientTop;
      currentY = currentY.offsetParent;
    }
    //返回结果
    return { x: actualLeft, y: actualTop };
  }
}
// modules.export = verificationCode
// export default verificationCode;
