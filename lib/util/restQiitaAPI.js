'use strict';

// Qiita API v2 documant https://qiita.com/api/v2/docs

module.exports = function(qiitaTeam, qiitaToken) {
  var restQiitaAPI = {};
  const team = qiitaTeam;
  const token = qiitaToken;

  const axiosBase = require('axios');
  const axios = axiosBase.create({
    baseURL: `https://${team}.qiita.com/api/v2`,
    headers: {
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
      'authorization': `Bearer ${token}`
    },
    responseType: 'json'
  });

  function restAPI(path) {
    return axios.get(path)
      .then(function(res) {
        const data = res.data;
        const total = res.headers['total-count'];
        return {data, total};
      })
      .catch(function(err) {
        return err;
      });
  };

  restQiitaAPI.getQiitaUser = async function() {
    try {
      const res = await restAPI('/users');
      const user = res.data;
      if(user.length > 0) {
        return user;
      }
    } catch (err) {
      throw err;
    }
  };

  restQiitaAPI.getQiitaPages = async function(pageNum, per_page) {
    try {
      const res = await restAPI(`/items?page=${pageNum}&per_page=${per_page}`);
      const pages = res.data;
      const total = res.total;
      if(pages.length > 0) {
        return {pages, total};
      }
    } catch (err) {
      throw err;
    }
  };

  return restQiitaAPI;
}
