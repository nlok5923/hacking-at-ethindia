module.exports = {
    resolve: {
        fallback: { "constants": require.resolve("constants-browserify") }
    }
}