package demo

import (
	"go.k6.io/k6/js/modules"
)

func init() {
	modules.Register("k6/x/demo", new(Demo))
}

type Demo struct{}

func (*Demo) getAnswer() int {
	return 42
}
