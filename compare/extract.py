# read in json from ./test.txt and extract the data

import json
import sys


def get_corresponding_id(net_id):

    lookup = open("./lookup.txt", "r")

    for lookup_line in lookup:
        ni = lookup_line.split(" ")[0]
        if (ni == net_id):
            return lookup_line.split(" ")[1][:-1]
    return None


def build():

    names = open("./input.txt", "r")

    mapping = {}

    for line in names:
        audit_id = line.split("\t")[1][:-1]
        net_id = line.split("\t")[0].replace("@nyu.edu", "")
        res = get_corresponding_id(net_id)
        if res:
            mapping[audit_id] = res

    print(mapping)


build()

