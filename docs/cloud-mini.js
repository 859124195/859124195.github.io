/* ============================================================
 * 班级同学了解表 · 轻量云数据库客户端
 * 替代 72KB 官方 SDK——只用两个能力：
 *   ① 匿名插入一条问卷回答   cloud.database.from(表).insert({answers})
 *   ② 带密码读取统计结果     cloud.database.rpc('get_survey_results', {pwd})
 * 协议与官方 SDK 完全一致：
 *   - POST {endpoint}/.cloud/database/rest/<表>        （JSON  body）
 *   - POST {endpoint}/.cloud/database/rest/rpc/<函数>  （JSON  body）
 *   - 头：x-wb-webapp-access-key: <publishableKey>（匿名模式不带 Authorization）
 * 依赖：本文件必须在 survey-config.js 之后加载（PUBLIC_CONFIG / TABLE_NAME）
 * ============================================================ */
(function () {
  'use strict';

  function miniCall(path, body) {
    var base = String(PUBLIC_CONFIG.endpoint).replace(/\/+$/, '') + '/.cloud/database/rest';
    return fetch(base + path, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-wb-webapp-access-key': PUBLIC_CONFIG.publishableKey
      },
      body: JSON.stringify(body)
    }).then(function (res) {
      return res.text().then(function (text) {
        var data = null;
        if (text) { try { data = JSON.parse(text); } catch (e) { data = null; } }
        if (!res.ok) {
          var msg = (data && (data.message || (data.error && data.error.message))) ||
                    ('请求失败（HTTP ' + res.status + '）');
          return { data: null, error: { message: msg, code: data && data.code, status: res.status } };
        }
        return { data: data, error: null };
      });
    });
  }

  /* 与 SDK 相同的调用形状，页面逻辑零改动 */
  window.initCloud = function () {
    return {
      database: {
        from: function (table) {
          return {
            insert: function (payload) { return miniCall('/' + table, payload); }
          };
        },
        rpc: function (name, args) { return miniCall('/rpc/' + name, args || {}); }
      }
    };
  };
})();
