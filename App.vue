<script>
export default {
  created() {
    const query = this.getQuery();

    if (query.token) {
      localStorage.setItem('token', query.token);
    }
  },
  methods: {
    getQuery() {
      const query = {};
      // 关键：取 hash 后的参数
      const hash = window.location.hash || '';
      const queryStr = hash.split('?')[1] || '';
      const arr = queryStr.split('&');
      arr.forEach((item) => {
        const [key, val] = item.split('=');
        if (key) {
          query[key] = decodeURIComponent(val);
        }
      });

      return query;
    },
  },
};
</script>

<style lang="scss">
@import 'uview-ui/index.scss';
</style>
