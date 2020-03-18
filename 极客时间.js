// ==UserScript==
// @name         极客时间
// @namespace    none
// @version      0.1
// @description  极客时间解锁部分文章
// @author       wlor
// @match       https://time.geekbang.org/column/article/*
// @grant        none

// @require https://cdn.bootcss.com/axios/0.19.2/axios.min.js
// @require https://cdn.bootcss.com/jquery/3.4.1/jquery.min.js
// ==/UserScript==

(async function () {
  'use strict';
  axios.interceptors.request.use(function (config) {
    // 在发送请求之前做些什么
    config.headers['Content-Type'] = 'application/json'
    return config;
  }, function (error) {
    // 对请求错误做些什么
    return Promise.reject(error);
  });

  // 添加响应拦截器
  axios.interceptors.response.use(function (response) {
    // 对响应数据做点什么
    return response;
  }, function (error) {
    // 对响应错误做点什么
    return Promise.reject(error);
  });

  function get_cid(params) {
    return new Promise((resolve, reject) => {
      let id = location.href.match(/article\/(.*)?/)[1];
      axios.post('https://time.geekbang.org/serv/v1/article', {
          "id": id,
          "include_neighbors": true,
          "is_freelyread": true
        })
        .then((res) => {
          resolve(res.data.data.column_id)
        })
        .catch((error) => {
          reject(error)
        });
    });
  }
  let cid = await get_cid();
  let articles = await get_articles(cid);
  create_html(articles)

  function get_articles(cid) {
    return new Promise((resolve, reject) => {
      axios.post('https://time.geekbang.org/serv/v1/column/articles', {
          "cid": cid,
          "size": 1000,
          "prev": 0,
          "order": "earliest",
          "sample": false
        })
        .then((res) => {
          resolve(res.data.data.list)
        })
        .catch((error) => {
          reject(error)
        });
    });
  }

  function create_html(array) {
    let html = "";
    for (let i = 0; i < array.length; i++) {
      html += `<p><a class="my_link" style="  color: #555;" href="https://time.geekbang.org/column/article/${array[i].id}" >${i+1} | ${array[i].article_sharetitle}</a></p>`
    }
    $('body').append(`
<div style="position: fixed;
background-color: #fff;
left: 0;
top: 250px;
bottom:0;
padding: 20px;
font-size: 13px;
width: 380px;
box-sizing: border-box;
z-index: 999999;">
${html}
</div>
`)

  }
})();
