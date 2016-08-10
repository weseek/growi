
const body = `# ほげ

検診 <- これは highlight
<a href="検診">検診</a>

[検診](検診) <- non highlight

ほげ(検診)ほげ <- highlight
ほげ[検診]ほげ <- highlight

<a href="検診">検診</a> 検診 <- nhl hl hl
`;

const k = '検診'; //keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const keywordExp = new RegExp(`(${k}(?!(.*?\]|.*?\\)|.*?"|.*?>)))`, 'ig');

console.log(body.replace(keywordExp, '<em class="highlighted">$&</em>'));
