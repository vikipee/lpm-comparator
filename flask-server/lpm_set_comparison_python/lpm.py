from pm4py.objects.petri_net.obj import PetriNet, Marking

# Define a custom class to hold the Petri net and its markings
class LPM:
    def __init__(self, net: PetriNet, im: Marking, fm: Marking):
        self.net = net
        self.im = im
        self.fm = fm

    def __repr__(self):
        return f"LPM(net={self.net}, im={self.im}, fm={self.fm})"
