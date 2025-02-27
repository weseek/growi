# Header

<div class="container-fluid">
    <div class="row sampleRow">
        <div class="col-md-4">
            <div class="lsxContainerTitle">FOO</div>

$foo(depth=2, filter=(FOO))
        </div>
        <div class="col-md-4">
            <div class="lsxContainerTitle">BAR</div>

$bar(depth=2, filter=BAR)
        </div>
        <div class="col-md-4">
            <div class="lsxContainerTitle">BAZ</div>

$baz(depth=2, filter=baz)
</div>
    </div>
    <hr>
    <div class="row sampleRow">
        <div class="col-md-4">
            <div class="lsxContainerTitle">FOO</div>

$foo-2(depth=2, depth=1, except=(word1|word2|word3))
</div>
        <div class="col-md-4">
            <div class="lsxContainerTitle">BAR</div>

$bar-2(depth=2, depth=1, except=(word1|word2|word3))
</div>
        <div class="col-md-4">
                <div class="lsxContainerTitle">BAZ</div>

$baz-2(depth=2, depth=1, except=(word1|word2|word3))
</div>
    </div>
</div>